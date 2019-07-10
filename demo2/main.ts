import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SpotfireViewerComponent, DocumentService } from '@tibco/spotfire-wrapper';
import { MatTabsModule } from '@angular/material';

@Component({
  selector: 'my-spotfire',
  template: `Override spotfire-wrapper template :
  <button *ngFor="let p of ['Sales performance', 'Territory analysis', 'Effect of promotions']" (click)="openPage(p)">{{p}}</button>
  <div class="mys" #spot></div>`,
  styles: [`
  div.mys { width:100%; height:1600px; background:#ebebeb; border-radius: 20px}
  button { padding:10px }
`]
})
class MySpotfireWrapperComponent extends SpotfireViewerComponent implements OnInit {
  // No var please (or set a contructor)
  ngOnInit(): void {
    // Url and customization have been initialized when using <my-spotfire> but may be set here,
    // just like path, markingOn, ... are:
    this.path = 'Samples/Sales and Marketing';
    // this.path = '/TIBCO Labs/ProcessMining_custom_queries_final';
    // Marking can detail list of tables and their columns or '*' for all tables.
    // When tables names are specified, user can detail list of columns to retrieve or all with '*'
    // this.markingOn = { SalesAndMarketing: ['*'] };
    // this.markingOn = '*';
    // this.maxRows = 12;

    // Marking is subscribed twice. Here and in AppComponent thru (markingEvent) on <my-spotfire> call
    //
    this.markingEvent.subscribe(e => console.log('[MySpotfireWrapperComponent] MARKING MySpot returns', e));

    // show default page:
    this.display();
    this.metadata$.subscribe(f => console.log('Metadata', f, JSON.stringify(f)));
  }
}
@Component({
  selector: 'app-root',
  template: `
<h2>Angular app "{{title|uppercase}}"</h2>
<div style='display:flex'>
<!--
<my-spotfire  style='width:80%; height:800px;'
[url]="urlA"
[page]="'Case Details'" [customization]="cust"
(markingEvent)="onMarking($event)"
[filters]="filtersA"
(filteringEvent)="onFiltering($event)"
[debug]="true">
</my-spotfire>
-->

<my-spotfire  style='width:50%'
[url]="urlA" [customization]="cust"
(markingEvent)="onMarking($event)"
[filters]="filters"
(filteringEvent)="onFiltering($event)"
[debug]="true">
</my-spotfire>


<div style="display:none" id="ddom"></div>
<mat-tab-group *ngIf="false">
    <mat-tab label="First"> Content 1 </mat-tab>
    <mat-tab label="Second">
      <ng-template matTabContent>
        Content 2
      </ng-template>
    </mat-tab>
    <mat-tab label="Third"> Content 3 </mat-tab>
  </mat-tab-group>
  <pre style='font-size:8px'>MARKING{{markedData|json}}</pre>
  <pre style='font-size:8px'>FILTERS={{filtersOut|json}}</pre>
</div>
`})
class AppComponent {
  url = 'https://23.22.187.212';
  urlA = 'https://spotfire-next.cloud.tibco.com';
  cust = { showAuthor: true, showFilterPanel: true, showToolBar: true };
  filtersA = [];
  filtersB = [{
    dataColumnName: 'case_id',
    dataTableName: 'events',
    filterSettings: { values: ['A_07898', 'A_07896', 'A_07892'] }
  }/*,
  [{
    dataColumnName: 'combinedFilter',
    dataTableName: 'events',
    values: ['False'],
    filterType: 'CheckBoxFilter'
  }*/];
  /*[{
    dataTableName: 'SalesAndMarketing',
    dataColumnName: 'State',
    filterSettings: { values: ['Florida'] }
  }, {
    dataTableName: 'SalesAndMarketing',
    dataColumnName: 'City',
    filterSettings: { values: ['Fort Lauderdale'] }
  }, {
    dataTableName: 'SalesAndMarketing',
    dataColumnName: 'BCG segmentation',
    filterSettings: { values: ['Dogs', 'Stars'] }
  }, {
    dataTableName: 'SalesAndMarketing',
    dataColumnName: 'Class Sales',
    filterSettings: { 'highValue': '123', 'lowValue': '67' }
  }];*/
  //{ Region: ['NE'] };
  title = 'demo2';
  markedData = {};
  filtersOut = {};


  constructor(public docSvc: DocumentService) {
    this.docSvc.dump('main');

    this.docSvc.openWebPlayer$('ddom', this.urlA, 'Samples/Sales and Marketing').subscribe(g =>
      console.log('DocumentService.openWebPlayer$ returns', this.urlA, g));
  }


  // Marking can be subscribed outside component
  onMarking = (e: Event) => {
    console.log('[AppComponent] MARKING MySpot returns', e);
    this.markedData = e;
  }
  onFiltering = (e: Event) => {
    console.log('[AppComponent] FILTERING MySpot returns', e);
    this.filtersOut = e;
  }

}

@NgModule({
  bootstrap: [AppComponent],
  imports: [BrowserModule, ReactiveFormsModule, NoopAnimationsModule, MatTabsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AppComponent, MySpotfireWrapperComponent],
  entryComponents: [MySpotfireWrapperComponent]
})
class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));