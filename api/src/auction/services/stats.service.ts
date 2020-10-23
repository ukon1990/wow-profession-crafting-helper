import {S3Handler} from '../../handlers/s3.handler';
import {DatabaseUtil} from '../../utils/database.util';
import {EventSchema} from '../../models/s3/event-record.model';
import {GzipUtil} from '../../utils/gzip.util';
import {AuctionProcessorUtil} from '../utils/auction-processor.util';
import {NumberUtil} from '../../../../client/src/client/modules/util/utils/number.util';
import {StatsRepository} from '../repository/stats.repository';
import {ListObjectsV2Output} from 'aws-sdk/clients/s3';
import {RealmRepository} from '../../realm/repositories/realm.repository';
import {RealmService} from '../../realm/service';
import {AuctionStatsUtil} from '../utils/auction-stats.util';
import {ItemStats} from '../models/item-stats.model';
import {DateUtil} from '@ukon1990/js-utilities';

const request: any = require('request');
const PromiseThrottle: any = require('promise-throttle');

export class StatsService {
  realmRepository: RealmRepository;

  constructor() {
    this.realmRepository = new RealmRepository();
  }

  /* istanbul ignore next */
  async getPriceHistoryFor(ahId: number, id: number, petSpeciesId: number = -1, bonusIds?: any[], onlyHourly = true,
                           conn: DatabaseUtil = new DatabaseUtil(false)): Promise<any> {
    console.log(`getPriceHistoryFor ahId=${ahId} item=${id} pet=${petSpeciesId}`);
    if (onlyHourly) {
      return new Promise((resolve, reject) => {
        this.getPriceHistoryHourly(ahId, id, petSpeciesId, bonusIds, conn)
          .then(r => {
            resolve(r);
          })
          .catch(error => {
            console.error(error);
            reject({
              status: 500,
              message: error.message
            });
          });
      });
    }
    const result = {
      hourly: [],
      daily: [],
    };
    return new Promise(async (resolve, reject) => {
      try {
        conn.enqueueHandshake()
          .then(() => {
            Promise.all([
              this.getPriceHistoryHourly(ahId, id, petSpeciesId, bonusIds, conn)
                .then(r => result.hourly = r)
                .catch(console.error),
              this.getPriceHistoryDaily(ahId, id, petSpeciesId, bonusIds, conn)
                .then(r => result.daily = r)
                .catch(console.error)
            ])
              .then(() => {
                AuctionProcessorUtil.setCurrentDayFromHourly(result);
                resolve(result);
              })
              .catch(error => {
                console.error(error);
                reject({
                  status: 500,
                  message: error.message
                });
              });
          })
          .catch(error => {
            console.error(error);
            reject({
              status: 500,
              message: error.message
            });
          });
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  private getPriceHistoryHourly(ahId: number, id: number, petSpeciesId: number, bonusIds: number[], conn: DatabaseUtil): Promise<any> {
    return new Promise((resolve, reject) => {
      new StatsRepository(conn).getPriceHistoryHourly(ahId, id, petSpeciesId, bonusIds)
        .then((result => {
          resolve(AuctionProcessorUtil.processHourlyPriceData(result));
        }))
        .catch((error) => {
          console.error(error);
          resolve([]);
        });
    });
  }

  private getPriceHistoryDaily(ahId: number, id: number, petSpeciesId: number, bonusIds: number[], conn: DatabaseUtil): Promise<any[]> {
    return new Promise((resolve, reject) => {
      new StatsRepository(conn)
        .getPriceHistoryDaily(ahId, id, petSpeciesId, bonusIds)
        .then((result => {
          resolve(AuctionProcessorUtil.processDailyPriceData(result));
        }))
        .catch((error) => {
          console.error(error);
          resolve([]);
        });
    });
  }


  insertStats(): Promise<void> {
    const insertStatsStart = +new Date();
    return new Promise<void>((resolve, reject) => {
      let completed = 0, total = 0, avgQueryTime;
      const s3 = new S3Handler(),
        conn = new DatabaseUtil(false);

      s3.list('wah-data-eu-se', 'statistics/inserts/', 50)
        .then(async (objects: ListObjectsV2Output) => {
          total = objects.Contents.length;
          if (total > 0) {
            await new RealmService().updateAllRealmStatuses()
              .catch(console.error);
          }

          conn.enqueueHandshake()
            .then(async () => {
              objects.Contents
                .sort((a, b) =>
                  +new Date(a.LastModified) - +new Date(b.LastModified));

              for (const object of objects.Contents) {
                if ((+new Date() - insertStatsStart) / 1000 < 50) {
                  const [status]: { activeQueries: number }[] = await new StatsRepository(conn).getActiveQueries()
                    .catch(error => console.error(`StatsService.insertStats.Contents`, error));

                  if (status.activeQueries < 10) {
                    await s3.getAndDecompress(objects.Name, object.Key)
                      .then(async (query: string) => {
                        if (query) {
                          const insertStart = +new Date();
                          await conn.query(query)
                            .then(async () => {
                              const [region, ahId] = object.Key.split('/')[2].split('-');
                              await Promise.all([
                                s3.deleteObject(objects.Name, object.Key)
                                  .catch(console.error),
                                this.realmRepository.updateEntry(+ahId, {
                                  lastStatsInsert: +new Date(),
                                }).catch(console.error)
                              ])
                                .catch(console.error);
                              completed++;
                            })
                            .catch(console.error);
                          if (!avgQueryTime) {
                            avgQueryTime = +new Date() - insertStart;
                          } else {
                            avgQueryTime = (avgQueryTime + +new Date() - insertStart) / 2;
                          }
                        }
                      })
                      .catch(error => console.error(`StatsService.insertStats.Contents`, error));
                  } else {
                    console.log('There are too many active queries', status.activeQueries);
                  }
                } else {
                  console.log('The time since limit has passed');
                }
              }
              console.log(`Completed ${completed} / ${total} in ${+new Date() - insertStatsStart} ms with an avg of ${avgQueryTime} ms`);
              conn.end();
              resolve();
            })
            .catch(error => {
              console.error(error);
              reject(error);
            });
        })
        .catch(error => {
          console.error(error);
          conn.end();
          reject(error);
        });
    });
  }

  processRecord(record: EventSchema, conn: DatabaseUtil = new DatabaseUtil()): Promise<void> {
    const start = +new Date();
    return new Promise<void>((resolve, reject) => {
      if (!record || !record.object || !record.object.key) {
        resolve();
      }
      const regex = /auctions\/[a-z]{2}\/[\d]{1,4}\/[\d]{13,999}-lastModified.json.gz/gi;
      if (regex.exec(record.object.key)) {
        const splitted = record.object.key.split('/');
        console.log('Processing S3 auction data update');
        const [_, region, ahId, fileName] = splitted;
        new S3Handler().get(record.bucket.name, record.object.key)
          .then(async data => {
            await new GzipUtil().decompress(data['Body'])
              .then(({auctions}) => {
                const lastModified = +fileName.split('-')[0];
                if (!lastModified) {
                  resolve();
                  return;
                }
                const {
                  list,
                  hour
                } = AuctionProcessorUtil.process(auctions, lastModified, +ahId);
                const query = StatsRepository.multiInsertOrUpdate(list, hour);
                new S3Handler()
                  .save(query, `statistics/inserts/${region}-${ahId}-${fileName}.sql.gz`, {region: 'eu-se'})
                  .then(ok => {
                    console.log(`Processed and uploaded statistics SQL in ${+new Date() - start} ms`);
                    resolve(ok);
                  })
                  .catch(error => {
                    reject(error);
                  });
              })
              .catch(reject);
          })
          .catch(reject);
      }
    });
  }

  updateAllRealmDailyData(start: number, end: number, conn = new DatabaseUtil(false), daysAgo = 1): Promise<any> {
    return new Promise((resolve, reject) => {
      const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: 5,
        promiseImplementation: Promise
      });
      const promises = [];
      let processed = 0;
      for (let id = start; id <= end; id++) {// 242
        promises.push(promiseThrottle.add(() =>
          new Promise((ok) => {
            this.compileDailyAuctionData(id, conn, this.getYesterday(daysAgo))
              .then(() => {
                processed++;
                console.log(`Processed count: ${processed} of ${end - start} - date=${this.getYesterday(daysAgo).toString()}`);
                ok();
              })
              .catch((error) => {
                processed++;
                console.error(`ah=${id} date=${this.getYesterday().toString()}`, error);
                ok();
              });
          })));
      }

      Promise.all(promises)
        .then(() => {
          conn.end();
          resolve();
        })
        .catch(error => {
          conn.end();
          reject();
        });
    });
  }

  updateNextRealmsDailyPrices(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const conn = new DatabaseUtil(false),
        startTime = +new Date();
      let completed = 0, avgQueryTime;
      conn.enqueueHandshake()
        .then(() => {
          this.realmRepository.getRealmsThatNeedsDailyPriceUpdate()
            .then(async realms => {
              for (const {id} of realms) {
                if (DateUtil.timeSince(startTime, 's') < 40) {
                  const queryStart = +new Date();
                  await this.compileDailyAuctionData(id, conn, this.getYesterday(1))
                    .then(() => {
                      this.realmRepository.updateEntry(id, {
                        lastDailyPriceUpdate: +new Date(),
                      })
                        .then(() => {
                          completed++;
                        })
                        .catch(console.error);
                    })
                    .catch(console.error);
                  const queryTime = +new Date() - queryStart;
                  if (!avgQueryTime) {
                    avgQueryTime = queryTime;
                  } else {
                    avgQueryTime = (avgQueryTime + queryTime) / 2;
                  }
                }
              }

              console.log(`Done updating daily price for ${completed}/${realms.length
              } houses. Avg query time was ${avgQueryTime}`);
              conn.end();
              resolve();
            })
            .catch(error => {
              conn.end();
              reject(error);
            });
        })
        .catch(error => {
          conn.end();
          reject(error);
        });
    });
  }

  compileDailyAuctionData(id: number, conn = new DatabaseUtil(false), date = this.getYesterday()): Promise<any> {
    console.log('Updating daily price data');
    const dayOfMonth = AuctionProcessorUtil.getDateNumber(date.getUTCDate());
    return new Promise<any>((resolve, reject) => {
      new StatsRepository(conn).insertStats(id, date, dayOfMonth)
        .then(rows => {
          const list = [];
          rows.forEach(row => {
            AuctionProcessorUtil.compilePricesForDay(id, row, date, dayOfMonth, list);
          });
          if (!list.length) {
            resolve();
            return;
          }

          console.log('Done updating daily price data');
          new StatsRepository(conn).multiInsertOrUpdateDailyPrices(list, dayOfMonth)
            .then(resolve)
            .catch(error => {
              console.error('SQL error for id=', id);
              reject(error);
            });
        })
        .catch(reject);
    });
  }

  private getYesterday(days = 1): Date {
    return new Date(+new Date() - 1000 * 60 * 60 * 24 * days);
  }

  /*
  * Add a new column to the AH table indicating when the last delete was ran
  * Run once each 6-10 minute
  * Limit 1 order by time since asc (to get the oldest first)
  * */
  deleteOldPriceHistoryForRealm(conn = new DatabaseUtil(false)): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const repository = new StatsRepository(conn);
      const [status]: { activeQueries: number }[] = await repository.getActiveQueries()
        .catch(error => console.error(`StatsService.deleteOldPriceHistoryForRealm`, error));

      if (status.activeQueries < 1) {
        const day = 1000 * 60 * 60 * 24;
        const now = new Date();
        /*
        now.setUTCHours(0);
        now.setUTCMinutes(0);

        now.setUTCMilliseconds(0);
        */


        repository.getNextHouseInTheDeleteQueue()
          .then(async (res) => {
            if (res.length) {
              const {id} = res[0];

              repository.deleteOldAuctionHouseData(id, now, day)
                .then((deleteResult) => {
                  deleteResult.affectedRows = NumberUtil.format(deleteResult.affectedRows);
                  repository
                    .updateLastDeleteEvent(id)
                    .then(() => {
                      console.log('Successfully deleted old price data', deleteResult);
                      conn.end();
                      resolve();
                    })
                    .catch(error => {
                      console.error(error);
                      conn.end();
                      reject(error);
                    });
                })
                .catch(error => {
                  console.error(error);
                  conn.end();
                  reject(error);
                });
            } else {
              conn.end();
              resolve();
            }
          })
          .catch(error => {
            console.error(error);
            conn.end();
            reject(error);
          });
      } else {
        conn.end();
        console.log('Too many active queries', status.activeQueries);
        resolve();
      }
    });
  }

  deleteOldPriceForRealm(table: string, olderThan: number, period: string, conn = new DatabaseUtil(false)): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      new StatsRepository(conn).deleteOldDailyPricesForRealm(table, olderThan, period)
        .then(() => {
          conn.end();
          resolve();
        })
        .catch((err) => {
          conn.end();
          reject(err);
        });
    });
  }

  updateRealmTrends(): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = +new Date();
      const conn = new DatabaseUtil(false);
      conn.enqueueHandshake()
        .then(() => {
          this.realmRepository.getRealmsThatNeedsTrendUpdate()
            .then(async (houses) => {
              const {region, id} = houses.sort((a, b) =>
                a['lastTrendUpdateInitiation'] - b['lastTrendUpdateInitiation'])[0];
              await this.setRealmTrends(region, id, conn)
                .then(async () => {
                  await new RealmService().createLastModifiedFile(id, region)
                    .catch(err => console.error('Could not createLastModifiedFile', err));
                })
                .catch(console.error);
              console.log(`Done updating in ${DateUtil.timeSince(startTime, 's')} sec`);
              conn.end();
              resolve();
            })
            .catch(err => {
              conn.end();
              reject(err);
            });
        })
        .catch(err => {
          conn.end();
          reject(err);
        });
    });
  }

  setRealmTrends(region: string, ahId: number, db: DatabaseUtil): Promise<void> {
    const start = +new Date();
    console.log('Starting setRealmTrends for', region, ahId);
    return new Promise<void>(async (resolve, reject) => {
      await this.realmRepository.updateEntry(ahId, {id: ahId, lastTrendUpdateInitiation: +new Date()})
        .catch(console.error);
      new StatsRepository(db).getAllStatsForRealmDate(ahId)
        .then(rows => {
          const downloadAndQueryTime = +new Date() - start;
          console.log(`Query took ${downloadAndQueryTime} ms`);
          const processStart = +new Date();
          try {
            const result: ItemStats[] = AuctionStatsUtil.processDays(rows);
            console.log('Done proccessing with a result of ' + result.length + ' item variations');
            if (result.length) {
              const lastModified = +new Date();
              new S3Handler().save({
                lastModified: +new Date(),
                data: result
              }, `stats/${ahId}.json.gz`, {region})
                .then(success => {
                  console.log(`Processed and uploaded total ${(+new Date() - start)
                  } ms, processing=${
                    +new Date() - processStart
                  } ms`, success);
                  this.realmRepository.updateEntry(ahId, {
                    id: ahId, stats: {
                      lastModified,
                      url: success.url
                    }
                  })
                    .then(() => resolve(success))
                    .catch(e => {
                      console.error('setRealmTrends', e);
                      reject(e);
                    });
                })
                .catch(e => {
                  console.error('Failed in ' + (+new Date() - start) + 'ms', e);
                  reject(e);
                });
            }
            resolve();
          } catch (e) {
            console.error('Failed in ' + (+new Date() - start) + 'ms', e);
            reject(e);
          }
        })
        .catch(reject);
    });
  }
}
