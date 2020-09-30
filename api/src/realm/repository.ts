import {BaseRepository} from '../repository/base.repository';
import {AWSError} from 'aws-sdk';
import {AuctionHouse, AuctionHouseUpdateLog} from './model';
import {RealmStatus} from '../../../client/src/client/models/realm-status.model';

interface DumpDelay {
  lowestDelay: number;
  highestDelay: number;
  avgDelay: number;
}

export class RealmLogRepository extends BaseRepository<AuctionHouseUpdateLog> {
  add(data: AuctionHouseUpdateLog): Promise<AuctionHouseUpdateLog> {
    return Promise.resolve(undefined);
  }

  getAllAfterTimestamp(timestamp: number): Promise<AuctionHouseUpdateLog[]> {
    return Promise.resolve([]);
  }

  getById(id: string | number): Promise<AuctionHouseUpdateLog> {
    return Promise.resolve(undefined);
  }

  constructor() {
    super('wah_auction_houses_update_log');
  }

  getUpdateDelays(id: number): Promise<DumpDelay> {
    return new Promise<DumpDelay>((resolve, reject) => {
      const threeDaysAgo = +new Date() - 1000 * 60 * 60 * 72;
      this.getByIdAfter(id, threeDaysAgo)
        .then((result) => {
          if (!result.length) {
            reject();
            return;
          }
          const minuteInMS = 1000 * 60;

          result.sort((a, b) =>
            a.lastModified - b.lastModified);

          let min = 60 * minuteInMS, max = 60 * minuteInMS, avg;
          for (let i = 1; i < result.length; i++) {
            const current = result[i];
            const previous = result[i - 1];
            const diff = current.lastModified - previous.lastModified;

            if (diff > minuteInMS) {
              if (!avg) {
                avg = diff;
              } else {
                avg = (avg + diff) / 2;
              }

              if (min > diff) {
                min = diff;
              }

              if (max < diff) {
                max = diff;
              }
            }
          }

          resolve({
            lowestDelay: Math.round(min / minuteInMS),
            avgDelay: Math.round(avg / minuteInMS),
            highestDelay: Math.round(max / minuteInMS)
          });
        })
        .catch(reject);
    });
  }
}

export class RealmRepository extends BaseRepository<AuctionHouse> {
  repository: RealmLogRepository;

  constructor() {
    super('wah_auction_houses');
    this.repository = new RealmLogRepository();
  }

  add(data: any): Promise<AWSError | any> {
    return this.put(data);
  }

  getAllAfterTimestamp(timestamp: number): Promise<AuctionHouse[]> {
    return this.getAllAfter(timestamp);
  }

  private connectRealmsFromHouses(houses: AuctionHouse[]) {
    const realms: RealmStatus[] = [];
    houses.forEach(house =>
      house.realms.forEach(realm => {
        realms.push({
          id: house.id,
          ahId: house.id,
          region: house.region,
          slug: realm.slug,
          name: realm.name,
          connectedTo: house.realmSlugs.split(','),
          battlegroup: house.battlegroup,
          locale: realm.locale,
          timezone: realm.timezone,
          url: house.url,
          tsmUrl: house.tsm.url,
          lastModified: house.lastModified,
          size: house.size,
          lowestDelay: house.lowestDelay,
          avgDelay: house.avgDelay,
          highestDelay: house.highestDelay,
        });
      }));
    return realms;
  }

  getHouseToUpdateTSMFor(): Promise<AuctionHouse[]> {
    return new Promise<AuctionHouse[]>((resolve, reject) => {
      this.getAllAfterTimestamp(0)
        .then(houses =>
          resolve(houses
            .filter((house: AuctionHouse) =>
              house.region === 'eu' || house.region === 'us')
            .sort((a, b) =>
              a.tsm.lastModified - b.tsm.lastModified)))
        .catch(reject);
    });
  }

  getRealmsToUpdate(): Promise<AuctionHouse[]> {
    return new Promise<AuctionHouse[]>((resolve, reject) => {
      this.getAllAfterTimestamp(0)
        .then(houses =>
          resolve(houses
            .filter((house: AuctionHouse) =>
              +new Date() - house.lastModified >= house.lowestDelay * 1000 * 60)))
        .catch(reject);
    });
  }

  getAllRealmsSeparated(): Promise<RealmStatus[]> {
    return new Promise<RealmStatus[]>((resolve, reject) => {
      this.getAllAfterTimestamp(0)
        .then(houses => {
          const realms = this.connectRealmsFromHouses(houses);
          resolve(realms.sort((a, b) =>
            a.slug.localeCompare(b.slug)));
        })
        .catch(reject);
    });
  }

  getRealmsSeparated(id: number): Promise<RealmStatus[]> {
    return new Promise<RealmStatus[]>((resolve, reject) => {
      this.getById(id)
        .then(house => {
          const realms = this.connectRealmsFromHouses([house]);
          resolve(realms);
        })
        .catch(reject);
    });
  }

  getById(id: number): Promise<AuctionHouse> {
    return this.getOne(id);
  }


  getByRegionAndSlug(region: string, slug: string): Promise<AuctionHouse> {
    return new Promise<AuctionHouse>((resolve, reject) => {
      this.client.scan({
        TableName: this.table,
        FilterExpression: '#region = :region and contains(realmSlugs, :realmSlugs)',
        ExpressionAttributeNames: {
          '#region': 'region',
        },
        ExpressionAttributeValues: {
          ':region': region,
          ':realmSlugs': slug
        }
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Items[0] as AuctionHouse);
        }
      });
    });
  }

  addDumpLog(id: number, entry: any) {
    return new Promise((resolve, reject) => {
      this.client.put({
          TableName: 'wah_auction_houses_update_log',
          Item: {id, ...entry}
        },
        (error, data) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(data);
        });
    });
  }

  update(id: number, entry: { size: number; lastModified: number; id: number; url: string }) {
    return new Promise<void>((resolve, reject) => {
      this.repository.getUpdateDelays(id)
        .then(delays => {
          this.updateEntry(id, {
            ...entry,
            ...delays,
            nextUpdate: entry.lastModified + (delays.lowestDelay * 60 * 1000)
          })
            .then(() => {
              console.log(`Successfully updated ${id} with ${
                new Date(entry.lastModified).toUTCString()}`, delays);
              resolve();
            })
            .catch(error => {
              console.error('Could not update', delays, error);
              reject(error);
            });
        })
        .catch(error => {
          console.error('Could not get delay', error);
          reject(error);
        });
    });
  }

  realmConnection(fromId: number, toId: number): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      let fromHouse: AuctionHouse, toHouse: AuctionHouse;
      await this.getById(fromId)
        .then(house => {
          fromHouse = house;
        })
        .catch(console.error);
      await this.getById(toId)
        .then(house => {
          toHouse = house;
        })
        .catch(console.error);

      if (fromHouse && toHouse && fromHouse.realms.length && toHouse.realms.length) {
        this.updateEntry(toHouse.id, {
          realms: [
            ...toHouse.realms,
            ...fromHouse.realms
          ],
        })
          .then((updateOutput) => {
            this.delete(fromHouse.id)
              .then((deleteOutput) => {
                resolve({
                  updateOutput,
                  deleteOutput,
                });
              })
              .catch(error => {
                console.log('Could not delete the item');
                reject(error);
              });
          })
          .catch(error => {
            console.error('Could not update house');
            reject(error);
          });
      } else {
        reject('Nothing to delete');
      }
    });
  }
}