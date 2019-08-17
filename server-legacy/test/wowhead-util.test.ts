import {WoWHeadUtil} from '../src/util/wowhead.util';

describe('WoWHead string conversions', () => {
  it('getContainedInItem ', () => {
    const result = WoWHeadUtil.getContainedInItem(
      `new Listview({template: 'item', id: 'contained-in-item', data: [{"classs":15,"flags2":8192,"id":98133,"level":90,"name":"5Greater Cache of Treasures","reqlevel":85,"slot":0,"source":[4],"subclass":4,count:168147,outof:190538,pctstack:'{1: 44.6877,2: 44.9161,3: 10.3963}'}]});`);
    expect(result.length).toBeGreaterThan(0);
  });

  it('getContainedInObject', () => {
    const result = WoWHeadUtil.getContainedInObject(
      `new Listview({template: 'object', id: 'contained-in-object', data: [{"id":216253,"location":[6134],"name":"Faulty Valve","type":-9,count:2,outof:85},{"id":212225,"location":[5842],"name":"Shan'ze Cage","type":-9,count:3,outof:37},{"id":211584,"location":[6125],"name":"Ancient Control Console","type":-9,count:4,outof:6},{"id":211686,"location":[5841],"name":"Grummle Gear","type":-9,count:4,outof:11},{"id":214341,"location":[6138],"name":"Pheromone Mine","type":-9,count:6,outof:1069},{"id":218949,"location":[6716],"name":"Lei Shen's Burial Trove","type":3,count:7,outof:1966},{"id":217169,"location":[6507],"name":"Kirin Tor Perimeter Ward","type":-9,count:11,outof:46},{"id":213307,"location":[5842],"name":"Sra'thik Siege Weapon","type":-9,count:16,outof:64},{"id":210890,"location":[5805],"name":"Blazing Ember","type":-9,count:22,outof:1107},{"id":214895,"location":[5840],"name":"Shao-Tien Stormcaller","type":-9,count:38,outof:269},{"id":213304,"location":[5842],"name":"Sra'thik Idol","type":-9,count:39,outof:1204},{"id":214292,"location":[6138],"name":"Kunchong Cage","type":-9,count:61,outof:1271},{"id":210955,"location":[5805],"name":"Kunzen Ritual Candle","type":-9,count:185,outof:3549},{"id":233030,"name":"Unlocked Stockpile of Pandaren Spoils","type":3,count:193,outof:10802,pctstack:'{3: 41.9689,4: 2.07254,5: 12.4352,6: 1.03627,7: 1.5544,8: 3.10881,9: 6.73575,10: 4.66321,11: 7.25389,12: 1.5544,13: 5.18135,15: 1.03627,16: 0.518135,17: 2.59067,18: 4.66321,19: 3.62694}'},{"id":233028,"name":"Tears of the Vale","type":3,count:259,outof:15440,pctstack:'{3: 7.33591,4: 4.2471,5: 4.2471,6: 2.7027,7: 16.2162,8: 0.772201,9: 17.7606,10: 1.1583,11: 3.4749,12: 2.3166,13: 1.1583,14: 8.88031,15: 13.8996,16: 3.861,17: 5.79151,18: 4.6332,19: 1.5444}'},{"id":233029,"name":"Vault of Forbidden Treasures","type":3,count:327,outof:12044,pctstack:'{3: 1.52905,4: 3.0581,5: 7.03364,6: 51.9878,7: 5.19878,8: 2.44648,9: 2.75229,10: 3.66972,11: 1.52905,12: 1.22324,13: 10.0917,14: 2.75229,15: 0.917431,17: 0.917431,19: 4.89297}'},{"id":232166,"name":"Unlocked Stockpile of Pandaren Spoils","type":3,count:447,outof:1999,pctstack:'{3: 5.59284,4: 3.3557,5: 5.36913,6: 6.71141,7: 6.04027,8: 7.15884,9: 5.14541,10: 7.15884,11: 5.81656,12: 5.59284,13: 6.93512,14: 4.9217,15: 3.80313,16: 9.17226,17: 5.36913,18: 6.04027,19: 5.81656}'},{"id":213362,"name":"Ship's Locker","type":-8,count:544,outof:10784},{"id":232165,"name":"Unlocked Stockpile of Pandaren Spoils","type":3,count:562,outof:5765,pctstack:'{3: 4.80427,4: 7.65125,5: 4.80427,6: 7.11744,7: 3.73665,8: 5.33808,9: 4.98221,10: 6.76157,11: 5.69395,12: 5.87189,13: 8.00712,14: 6.40569,15: 5.51601,16: 6.58363,17: 4.4484,18: 6.58363,19: 5.69395}'},{"id":232093,"name":"Tears of the Vale","type":3,count:685,outof:12023,pctstack:'{3: 4.52555,4: 4.52555,5: 10.073,6: 5.54745,7: 6.86131,8: 5.10949,9: 5.54745,10: 4.67153,11: 4.81752,12: 5.9854,13: 4.08759,14: 5.83942,15: 8.32117,16: 4.9635,17: 7.73723,18: 5.40146,19: 5.9854}'},{"id":232092,"name":"Tears of the Vale","type":3,count:705,outof:2945,pctstack:'{3: 5.39007,4: 4.68085,5: 5.95745,6: 5.24823,7: 5.39007,8: 7.65957,9: 4.96454,10: 5.53191,11: 7.0922,12: 6.66667,13: 7.80142,14: 6.66667,15: 4.96454,16: 5.95745,17: 4.68085,18: 5.95745,19: 5.39007}'},{"id":232163,"name":"Vault of Forbidden Treasures","type":3,count:714,outof:10458,pctstack:'{3: 4.34174,4: 5.46218,5: 5.88235,6: 4.7619,7: 7.42297,8: 7.28291,9: 5.60224,10: 5.88235,11: 3.5014,12: 7.28291,13: 6.72269,14: 6.02241,15: 5.7423,16: 6.86275,17: 5.18207,18: 7.28291,19: 4.7619}'},{"id":232164,"name":"Vault of Forbidden Treasures","type":3,count:730,outof:2873,pctstack:'{3: 5.06849,4: 4.24658,5: 5.75342,6: 6.30137,7: 4.52055,8: 7.67123,9: 8.08219,10: 5.47945,11: 5.61644,12: 4.52055,13: 5.61644,14: 6.43836,15: 6.71233,16: 6.16438,17: 7.26027,18: 4.38356,19: 6.16438}'},{"id":213650,"location":[5805],"name":"Virmen Treasure Cache","type":-8,count:809,outof:13097},{"id":213774,"location":[5841],"name":"Lost Adventurer's Belongings","type":-8,count:1347,outof:11587},{"id":213770,"location":[5841],"name":"Stolen Sprite Treasure","type":-8,count:2974,outof:13214},{"id":213769,"location":[5841],"name":"Hozen Treasure Cache","type":-8,count:3225,outof:13465},{"id":213961,"location":[5842],"name":"Abandoned Crate of Goods","type":-8,count:3256,outof:11448},{"id":218772,"location":[6716],"name":"Golden Treasure Chest","type":3,count:16851,outof:213835,pctstack:'{1: 10.937,2: 10.6047,3: 10.8243,4: 13.9339,5: 10.5988,6: 10.9667,7: 11.3228,8: 10.4207,9: 10.3911}'},{"id":218757,"location":[6716],"name":"Mogu Treasure Chest","type":3,count:82330,outof:344825,pctstack:'{1: 11.7065,2: 10.5174,3: 11.0883,4: 10.6,5: 10.5454,6: 11.8389,7: 11.2256,8: 11.3252,9: 11.1527}'}]});`);
    expect(result.length).toBeGreaterThan(0);
  });

  it('getMilledFrom', () => {
    const result = WoWHeadUtil.getMilledFrom(
      `new Listview({template: 'item', id: 'milled-from', data: [{"classs":7,"flags2":-2147475456,"id":3356,"level":24,"name":"7Kingsblood","slot":0,"source":[2,5,17],"subclass":9,count:107207,outof:216792,pctstack:'{1: 94.9434,2: 2.56233,3: 2.49424}'},{"classs":7,"flags2":-2147475456,"id":3357,"level":30,"name":"7Liferoot","slot":0,"source":[2,5,17],"subclass":9,count:60045,outof:120824,pctstack:'{1: 94.7539,2: 2.61137,3: 2.63469}'}]});`);
    expect(result.length).toBeGreaterThan(0);
  });

  it('getProspectedFrom', () => {
    const result = WoWHeadUtil.getProspectedFrom(
      `new Listview({template: 'item', id: 'prospected-from', data: [{"classs":7,"flags2":-2147475456,"id":123918,"level":100,"name":"7Leystone Ore","slot":0,"source":[1,2,5,19],"sourcemore":[{"c":11,"icon":"inv_leystone","n":"Mass Prospect Leystone","s":755,"t":6,"ti":225902},{"z":7502}],"subclass":7,count:23,outof:472},{"classs":7,"flags2":-2147475456,"id":123919,"level":105,"name":"7Felslate","slot":0,"source":[1,2,5,19],"sourcemore":[{"c":11,"icon":"inv_felslate","n":"Mass Prospect Felslate","s":755,"t":6,"ti":225904},{"z":7502}],"subclass":7,count:11,outof:174,pctstack:'{2: 27.2727,3: 9.09091,4: 63.6364}'}]});`);
    expect(result.length).toBeGreaterThan(0);
  });

  it('getCurrencyFor', () => {
    const result = WoWHeadUtil.getCurrencyFor(
      `new Listview({template: 'item', id: 'currency-for', data: [{"classs":7,"flags2":-2147475456,"id":124440,"level":110,"name":"7Arkhana","slot":0,"source":[1,2,5,15],"sourcemore":[{"c":11,"icon":"inv_enchanting_70_arkhana","n":"Ley Shatter","s":333,"t":6,"ti":224199},{"n":"Illnea Bloodthorn","t":1,"ti":115264,"z":7502}],"subclass":12,cost:[0,[],[[124124,1]]],stack:[10]},{"classs":7,"flags2":-2147475456,"id":124441,"level":110,"name":"5Leylight Shard","slot":0,"source":[1,2,5,15],"sourcemore":[{"c":11,"icon":"inv_enchanting_70_leylightcrystal","n":"Chaos Shatter","s":333,"t":6,"ti":252106},{"n":"Illnea Bloodthorn","t":1,"ti":115264,"z":7502}],"subclass":12,cost:[0,[],[[124124,1]]],stack:[3]}]});`);
    expect(result.length).toBeGreaterThan(0);
  });

  it('getSoldBy', () => {
    const result = WoWHeadUtil.getSoldBy(
      `new Listview({template: 'npc', id: 'sold-by', data: [{"classification":1,"id":78456,"location":[5805],"maxlevel":90,"minlevel":90,"name":"Starlight Sinclair","react":[1,-1],"tag":"Prideful Gladiator","type":7,stock:-1,cost:[0,[],[[137642,2]]],stack:1},{"classification":1,"id":78461,"location":[5841],"maxlevel":93,"minlevel":93,"name":"Shonn Su","react":[null,1],"tag":"Prideful Gladiator","type":7,stock:-1,cost:[0,[],[[137642,2]]],stack:1}]});`);
    expect(result.length).toBeGreaterThan(0);
  });

  it('getDroppedBy', () => {
    const result = WoWHeadUtil.getDroppedBy(
      `new Listview({template: 'npc', id: 'dropped-by', data: [{"classification":0,"id":69580,"location":[6677,6507],"maxlevel":90,"minlevel":90,"name":"Onyx Stormclaw","react":[-1,-1],"type":1,count:2489,outof:3485,personal_loot:0},{"classification":0,"id":67760,"location":[6507],"maxlevel":90,"minlevel":90,"name":"Skumblade Scrounger","react":[-1,-1],"type":7,count:2766,outof:5150,personal_loot:0},{"classification":1,"id":72929,"location":[6738],"maxlevel":91,"minlevel":91,"name":"Sra'thik Amber-Master","react":[-1,-1],"type":7,count:11146,outof:25445,personal_loot:0,pctstack:'{1: 99.9462,7: 0.053831}'},{"classification":0,"id":70347,"location":[6507],"maxlevel":90,"minlevel":90,"name":"Skumblade Slasher","react":[0,0],"type":7,count:314,outof:1016,personal_loot:0},{"classification":1,"id":66755,"location":[6134,6138],"maxlevel":90,"minlevel":90,"name":"Shrouded Cetacean","react":[-1,-1],"type":1,count:7,outof:23,personal_loot:0},{"classification":0,"id":69402,"location":[6507],"maxlevel":90,"minlevel":90,"name":"Tomma","react":[0,0],"type":7,count:438,outof:1440,personal_loot:0},{"classification":0,"id":69229,"location":[6507],"maxlevel":90,"minlevel":90,"name":"Skumblade Saur-Priest","react":[0,0],"type":7,count:2192,outof:7292,personal_loot:0},{"classification":0,"id":70348,"location":[6507],"maxlevel":90,"minlevel":90,"name":"Skumblade Skirmisher","react":[0,0],"type":7,count:231,outof:774,personal_loot:0},{"classification":0,"id":69226,"location":[6507],"maxlevel":90,"minlevel":90,"name":"Skumblade Seadragon","react":[0,0],"type":7,count:4551,outof:15719,personal_loot:0},{"classification":0,"id":69210,"location":[6507],"maxlevel":90,"minlevel":90,"name":"Skumblade Fleshripper","react":[-1,-1],"type":7,count:18257,outof:63183,personal_loot:0},{"classification":0,"id":69227,"location":[6507],"maxlevel":90,"minlevel":90,"name":"Skumblade Scavenger","react":[-1,-1],"type":7,count:15700,outof:54533,personal_loot:0},{"classification":0,"id":59378,"location":[5840],"maxlevel":90,"minlevel":90,"name":"Paleblade Flesheater","react":[-1,-1],"type":7,count:13370,outof:46536,personal_loot:0},{"classification":0,"id":69338,"location":[6507],"maxlevel":90,"minlevel":90,"name":"Skumblade Brute","react":[0,0],"type":7,count:3551,outof:12394,personal_loot:0},{"classification":0,"id":69228,"location":[6507],"maxlevel":90,"minlevel":90,"name":"Skumblade Filthmonger","react":[-1,-1],"type":7,count:12195,outof:43462,personal_loot:0},{"classification":0,"id":69348,"location":[6507],"maxlevel":90,"minlevel":90,"name":"Skumblade Shortfang","react":[-1,-1],"type":7,count:1487,outof:5437,personal_loot:0},{"classification":0,"id":67748,"location":[6565],"maxlevel":90,"minlevel":90,"name":"Darkhatched Sorcerer","react":[-1,-1],"type":7,count:838,outof:3119,personal_loot:0},{"classification":1,"id":72927,"location":[6738],"maxlevel":92,"minlevel":92,"name":"Kovok","react":[-1,-1],"type":1,count:1796,outof:6715,personal_loot:0,pctstack:'{1: 99.8886,2: 0.111359}'},{"classification":0,"family":3,"id":64321,"location":[5805],"maxlevel":90,"minlevel":90,"name":"Echoweb Spinner","react":[-1,-1],"type":1,count:815,outof:3054,personal_loot:0}]});`);
    expect(result.length).toBeGreaterThan(0);
  });
});