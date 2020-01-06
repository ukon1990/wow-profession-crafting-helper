import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SetupComponent} from './settings/components/setup/setup.component';
import {CraftingComponent} from './crafting/components/crafting.component';
import {IsRegisteredService} from '../Is-registered.service';
import {DashboardComponent} from './dashboard/components/dashboard.component';
import {UpdateComponent} from './admin/components/update/update.component';
import {AuctionsComponent} from './auction/components/auctions/auctions.component';
import {TradeVendorsComponent} from './core/components/trade-vendors/trade-vendors.component';
import {WatchlistComponent} from './dashboard/components/manage/watchlist.component';
import {DashboardItemsComponent} from './dashboard/components/dashboard-items/dashboard-items.component';
import {PetsValueComponent} from './pet/components/pets-value.component';
import {MarketResetComponent} from './market-reset/components/market-reset/market-reset.component';
import {MillingComponent} from './crafting/components/milling/milling.component';
import {DisenchantingComponent} from './crafting/components/disenchanting/disenchanting.component';
import {AhSummaryComponent} from './dashboard/components/ah-summary/ah-summary.component';
import {ReputationsComponent} from './core/components/reputations/reputations.component';
import {TsmAddonDbComponent} from './tsm/components/tsm-addon-db.component';
import {ABOUT_ROUTE} from './about/about.route';
import {ProfitSummaryComponent} from './tsm/components/profit-summary/profit-summary.component';
import {TsmDatasetComponent} from './tsm/components/tsm-dataset/tsm-dataset.component';
import {TitledRoute} from '../models/route/titled-route.model';
import {TitledRoutes} from '../models/route/titled-routes.model';
import {SettingsComponent} from './settings/components/settings.component';
import {GeneralSettingsComponent} from './settings/components/general-settings/general-settings.component';
import {CraftingSettingsComponent} from './settings/components/crafting-settings/crafting-settings.component';
import {CustomPricesComponent} from './settings/components/crafting-settings/custom-prices/custom-prices.component';
import {CustomProcComponent} from './settings/components/crafting-settings/custom-proc/custom-proc.component';
import {CharactersComponent} from './character/components/characters.component';
import {NotificationSettingsComponent} from './settings/components/notification-settings/notification-settings.component';
import {AddNpcsComponent} from './admin/components/add-npcs/add-npcs.component';
import {DetailsComponent as NpcDetailsComponent} from './npc/components/details/details.component';
import {ListComponent as NpcListComponent} from './npc/components/list/list.component';

export const ROUTE_HIDDEN_FLAGS = {
  IS_NOT_REGISTERED: 'IS_NOT_REGISTERED',
  IS_REGISTERED: 'IS_REGISTERED',
  ONLY_IN_DEVELOP: 'ONLY_IN_DEVELOP',
  ALWAYS: 'ALWAYS'
};
const TOOLS_ROUTE: TitledRoute = {
  path: 'tools',
  title: 'Tools',
  canActivate: [IsRegisteredService],
  isHidden: ROUTE_HIDDEN_FLAGS.IS_NOT_REGISTERED,
  children: [
    {
      title: 'TSM Addon', path: 'tsm', component: TsmAddonDbComponent, children: [
        {
          title: 'Profit summary', path: 'summary', component: ProfitSummaryComponent, isHidden: ROUTE_HIDDEN_FLAGS.ALWAYS
        },
        {
          title: 'Data sets', isHidden: ROUTE_HIDDEN_FLAGS.ALWAYS,
          path: 'dataset', component: TsmDatasetComponent, children: [
            {path: ':name', component: TsmDatasetComponent}
          ]
        }
      ]
    },
    {
      title: 'Market reset', path: 'market-reset', component: MarketResetComponent
    },
    {
      title: 'Milling & Prospecting', path: 'milling-and-prospecting', component: MillingComponent
    },
    {
      title: 'Manage Dashboards', path: 'watchlist', redirectTo: '/dashboard/manage-dashboards'
    },
    {
      title: 'Reputations', path: 'reputations', component: ReputationsComponent
    }, {
      title: 'Pet value', path: 'pet-value', component: PetsValueComponent
    },
    {
      title: 'Trade vendors', path: 'trade-vendor', component: TradeVendorsComponent
    },
    /*
    {
      title: 'Sellers', path: 'sellers', component: SellersComponent
    },*/
    {
      title: 'Disenchanting',
      path: 'disenchanting',
      component: DisenchantingComponent,
      isHidden: ROUTE_HIDDEN_FLAGS.ONLY_IN_DEVELOP
    },
    {
      title: 'Vendors and mobs(NPCs)',
      path: 'npc',
      isHidden: ROUTE_HIDDEN_FLAGS.ONLY_IN_DEVELOP,
      children: [
        {
          path: '',
          component: NpcListComponent,
        },
        {
          path: ':id',
          component: NpcDetailsComponent
        }
      ]
    }
  ]
};

const DASHBOARD_ROUTE: TitledRoute = {
  title: 'Dashboard',
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [IsRegisteredService],
  isHidden: ROUTE_HIDDEN_FLAGS.IS_NOT_REGISTERED,
  children: [
    {path: '', pathMatch: 'full', redirectTo: 'items'},
    {
      title: 'Item', path: 'items', component: DashboardItemsComponent
    },
    /*
    {
      title: 'Seller', path: 'sellers', component: DashboardSellersComponent
    },*/
    {
      title: 'AH summary', path: 'ah-summary', component: AhSummaryComponent
    },
    {path: 'tsm', redirectTo: '/tools/tsm'},
    {
      title: 'Manage', path: 'manage-dashboards', component: WatchlistComponent
    }
  ]
};

const SETTINGS_ROUTE: TitledRoute = {
  title: 'Settings',
  path: 'settings',
  component: SettingsComponent,
  canActivate: [IsRegisteredService],
  isHidden: ROUTE_HIDDEN_FLAGS.IS_NOT_REGISTERED,
  children: [
    {
      path: '', redirectTo: 'settings/general', pathMatch: 'full'
    },
    {title: 'General', path: 'general', component: GeneralSettingsComponent},
    {
      title: 'Crafting', path: 'crafting', component: CraftingSettingsComponent, children: [
        {
          title: 'Custom prices', path: '', component: CustomPricesComponent
        },
        {
          title: 'Custom prices', path: 'custom-prices', component: CustomPricesComponent
        },
        {
          title: 'Custom proc rates', path: 'custom-proc', component: CustomProcComponent
        }
      ]
    },
    {
      title: 'Characters', path: 'characters', component: CharactersComponent
    },
    {
      title: 'Notifications', path: 'notifications', component: NotificationSettingsComponent
    }]
};

const ADMIN_ROUTE: TitledRoute = {
  title: 'Admin',
  path: 'admin',
  isHidden: ROUTE_HIDDEN_FLAGS.ONLY_IN_DEVELOP,
  canActivate: [IsRegisteredService],
  children: [
    {
      title: 'Update and add items',
      component: UpdateComponent,
      path: 'update-or-add'
    },
    {
      title: 'Add NPCs',
      component: AddNpcsComponent,
      path: 'add-npcs'
    }
  ]
};

export const appRoutes: TitledRoutes = [
  /*
    Handeling dashboard or setup rediret in the app.component constructor
  */
  {
    title: 'Setup',
    path: 'setup',
    component: SetupComponent,
    isHidden: ROUTE_HIDDEN_FLAGS.IS_REGISTERED
  },
  DASHBOARD_ROUTE,
  {
    title: 'Crafting',
    path: 'crafting',
    component: CraftingComponent,
    canActivate: [IsRegisteredService],
    isHidden: ROUTE_HIDDEN_FLAGS.IS_NOT_REGISTERED
  },
  {
    title: 'Auctions',
    path: 'auctions',
    canActivate: [IsRegisteredService],
    component: AuctionsComponent,
    isHidden: ROUTE_HIDDEN_FLAGS.IS_NOT_REGISTERED/*,
    children: [
      {title: 'Browse auctions', path: '', component: AuctionsComponent},
      {
        title: 'My auctions', path: 'my-auctions', component: MyAuctionsComponent, canActivate: [IsRegisteredService]
      }
    ]*/
  },
  {
    path: 'trade-vendor', pathMatch: 'full', redirectTo: 'tools/trade-vendor'
  },
  TOOLS_ROUTE,
  SETTINGS_ROUTE,
  ABOUT_ROUTE,
  ADMIN_ROUTE,
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}