import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AllProjectsRoutingModule} from './all-projects-routing.module';
import {AllProjectsComponent} from './all-projects.component';
import {RouterModule} from '@angular/router';
import {ProjectCardComponent} from './project-card/project-card.component';
import {PipesModule} from '../pipes/pipes.module';
import {PreloaderSpinnerModule} from '../libraries/materialize/preloader-spinner/preloader-spinner.module';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [AllProjectsComponent, ProjectCardComponent],
    imports: [
        CommonModule,
        RouterModule,
        AllProjectsRoutingModule,
        PipesModule,
        PreloaderSpinnerModule,
        ReactiveFormsModule
    ]
})
export class AllProjectsModule {
}
