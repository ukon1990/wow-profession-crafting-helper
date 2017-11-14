import { Component, OnInit } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { user, lists } from '../../utils/globals';
import { RealmService } from '../../services/realm.service';
import { CharacterService } from '../../services/character.service';
import { Title } from '@angular/platform-browser';

declare const ga: Function;
@Component({
  selector: 'app-selector',
  templateUrl: 'front.page.component.html'
})

export class FrontPageComponent implements OnInit {
  u;
  realmListEu = [];
  realmListUs = [];
  userCrafterForm: FormGroup;
  importSettingsForm: FormGroup;
  userCrafter: string;

  constructor(private formBuilder: FormBuilder, private router: Router,
    private titleService: Title, private rs: RealmService, private characterService: CharacterService) {
    this.userCrafterForm = formBuilder.group({
      'query': ''
    });
    this.importSettingsForm = formBuilder.group({
      'settings': ''
    });
    this.titleService.setTitle('Wah - Setup');
  }

  ngOnInit(): void {
    this.rs.getRealms().then(
      r => {
        this.realmListEu = r.region.eu;
        this.realmListUs = r.region.us;
      });
    if (localStorage.getItem('realm') !== null && localStorage.getItem('region') !== null) {
      this.router.navigateByUrl('/crafting');
    }
    this.u = user;
  }

  getRealms() {
    if (this.u.region === 'us') {
      return this.realmListUs['realms'] || [];
    } else {
      return this.realmListEu['realms'] || [];
    }
  }

  nextPage() {
    if (this.isValid()) {
      localStorage.setItem('region', this.u.region);

      localStorage.setItem('realm', this.u.realm);

      localStorage.setItem('character',
        this.u.character && this.u.character.length > 0 ? this.u.character : '');

      localStorage.setItem('api_tsm',
        this.u.apiTsm && this.u.apiTsm.length > 0 ? this.u.apiTsm : '');

      localStorage.setItem('api_wowuction',
        this.u.apiWoWu && this.u.apiWoWu.length > 0 ? this.u.apiWoWu : '');

      localStorage.setItem('crafters', this.u.crafters.toString());

      if (this.u.apiTsm && this.u.apiTsm.length > 0) {
        localStorage.setItem('api_to_use', 'tsm');
      } else if (this.u.apiWoWu && this.u.apiWoWu.length > 0) {
        localStorage.setItem('api_to_use', 'wowuction');
      } else {
        localStorage.setItem('api_to_use', 'none');
      }

      localStorage.setItem('timestamp_news', new Date().toLocaleDateString());

      // this.router.navigateByUrl('/crafting');
      ga('send', {
        hitType: 'event',
        eventCategory: 'User registration',
        eventAction: 'New user registered'
      });
      location.reload();
    }
  }

  isValid() {
    return this.u.region && this.u.region.length > 0 && this.u.realm && this.u.realm.length > 0;
  }

  getRealmValue(realm): void {
    this.u.realm = realm;
    console.log('realm: ' + realm);
  }

  importUserData(): void {
    this.u = JSON.parse(this.importSettingsForm.value['settings']);
  }

  addCrafter() {
    this.u.crafters.push(this.userCrafterForm.value['query']);
    this.userCrafterForm.value['query'] = '';
  }

  removeCrafter(index: number) {
    this.u.crafters.splice(index, 1);
  }

  getMyRecipeCount(): number {
    return lists.myRecipes.length;
  }
}
