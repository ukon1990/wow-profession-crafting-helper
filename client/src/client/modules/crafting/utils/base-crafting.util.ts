import {Recipe} from '../models/recipe';
import {SharedService} from '../../../services/shared.service';
import {ItemNpcDetails} from '../../item/models/item-npc-details.model';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {CustomProcUtil} from './custom-proc.util';
import {Reagent} from '../models/reagent';
import {CustomPrice} from '../models/custom-price';

export abstract class BaseCraftingUtil {
  static readonly STRATEGY = {
    OPTIMISTIC: 0,
    NEEDED: 1,
    PESSIMISTIC: 2
  };
  static readonly STRATEGY_LIST = [
    {id: 0, name: 'Optimistic', description: ''},
    {id: 1, name: 'Needed', description: ''},
    {id: 2, name: 'Pessimistic', description: ''}
  ];
  private ahCutModifier = 0.95;
  private hasMappedRecipes: boolean;
  private intermediateEligible: Recipe[] = [];
  private intermediateMap: Map<number, Recipe> = new Map();

  calculate(recipes: Recipe[]): void {
    if (!this.hasMappedRecipes) {
      recipes.forEach(r =>
        this.setSharedServiceRecipeMap(r));
      this.hasMappedRecipes = true;
    }
    recipes.forEach(r => this.calculateOne(r));
  }

  calculateOne(recipe: Recipe): void {
    if (!recipe) {
      return;
    }
    this.resetRecipePriceValues(recipe);
    this.setRecipePriceAndStatData(recipe);

    recipe.procRate = CustomProcUtil.get(recipe);
    recipe.reagents.forEach(r => {
      let price;
      const vendor = this.getVendorPriceDetails(r.itemID),
        overridePrice = this.getOverridePrice(r.itemID),
        tradeVendorPrice = this.getTradeVendorPrice(r.itemID);

      if (overridePrice) {
        price = overridePrice.price * r.count;
      } else if (vendor && vendor.price) {
        price = this.getCostFromVendor(vendor, r, price);
      } else if (tradeVendorPrice) {
        price = tradeVendorPrice * r.count;
      } else {
        price = this.getPrice(r.itemID, r.count);
      }
      if (!price) {
        price = this.getFallbackPrice(r.itemID, r.count);
      }
      r.avgPrice = price / r.count;
      recipe.cost += price / recipe.procRate;

      this.setRecipeForReagent(r, recipe);
    });
    recipe.roi = (recipe.buyout * this.ahCutModifier) - recipe.cost;
  }

  private resetRecipePriceValues(recipe: Recipe) {
    recipe.cost = 0;
    recipe.roi = 0;
    recipe.buyout = 0;
  }

  private setRecipeForReagent(r: Reagent, parentRecipe: Recipe) {
    const recipe: Recipe = SharedService.recipesMapPerItemKnown[r.itemID];
    if (!r.recipe && recipe) {
      r.recipe = recipe;
      if (!this.intermediateMap.get(parentRecipe.spellID)) {
        this.intermediateEligible.push(parentRecipe);
        this.intermediateMap.set(parentRecipe.spellID, parentRecipe);
      }
    }
  }

  private getCostFromVendor(vendor: { price: number; stock: number }, r: Reagent, price) {
    if (vendor && vendor.stock && vendor.stock < r.count) {
      price = vendor.price * vendor.stock;
      price += this.getPrice(r.itemID, r.count - vendor.stock);
    } else {
      price = vendor.price * r.count;
    }
    return price;
  }

  private setRecipePriceAndStatData(recipe: Recipe) {
    const auctionItem: AuctionItem = SharedService.auctionItemsMap[recipe.itemID];
    if (auctionItem) {
      recipe.buyout = auctionItem.buyout;
      recipe.mktPrice = auctionItem.mktPrice;
      recipe.avgDailySold = auctionItem.avgDailySold;
      recipe.regionSaleRate = auctionItem.regionSaleRate;
      recipe.quantityTotal = auctionItem.quantityTotal;
      recipe.regionSaleAvg = auctionItem.regionSaleAvg;
    }
  }

  private setSharedServiceRecipeMap(recipe: Recipe) {
    if (!SharedService.itemRecipeMap[recipe.itemID]) {
      SharedService.itemRecipeMap[recipe.itemID] = [];
    }
    SharedService.itemRecipeMap[recipe.itemID].push(recipe);

    // The user should see item combination items as "known"
    if (recipe.profession === 'none') {
      SharedService.recipesForUser[recipe.spellID] = ['Item'];
    }

    // For intermediate crafting
    if (SharedService.recipesForUser[recipe.spellID]) {
      if (!SharedService.recipesMapPerItemKnown[recipe.itemID] || SharedService.recipesMapPerItemKnown[recipe.itemID].cost > recipe.cost) {
        SharedService.recipesMapPerItemKnown[recipe.itemID] = recipe;
      }
    }
  }

  getFallbackPrice(id: number, quantity: number): number {
    const item: AuctionItem = SharedService.auctionItems[id];
    if (item) {
      return item.regionSaleAvg * quantity;
    }
    return 0;
  }

  getTradeVendorPrice(id: number): number {
    if (SharedService.tradeVendorItemMap[id] && SharedService.tradeVendorMap[id].useForCrafting) {
      return SharedService.tradeVendorItemMap[id].value;
    }
    return 0;
  }

  getVendorPriceDetails(id: number): { price: number; stock: number } {
    const item: ItemNpcDetails = SharedService.itemNpcMap.get(id);
    if (item) {
      return {
        price: item.vendorBuyPrice,
        stock: item.vendorAvailable < 0 ? 0 : item.vendorAvailable
      };
    }
    return undefined;
  }

  getOverridePrice(id: number): CustomPrice {
    if (SharedService.customPricesMap && SharedService.customPricesMap[id]) {
      return SharedService.customPricesMap[id];
    }
    return undefined;
  }

  abstract getPrice(id: number, quantity: number): number;
}
