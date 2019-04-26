import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { QuestionnaireDemo } from '../home/questionnaire-demo';
import { Entry } from 'ng-fhirjs';

@Component({
  selector: 'app-mapping-language',
  templateUrl: './mapping-language.component.html',
  styleUrls: ['./mapping-language.component.css'],
})
export class MappingLanguageComponent implements OnInit {
  public map: FormControl;
  public mapResult: any;
  public resource: any;

  constructor(private cd: ChangeDetectorRef) {
    this.resource = QuestionnaireDemo.getQuestionnaireEbida();
    this.map = new FormControl();
    this.map.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(term => {
        console.log('called with ' + term);
        if (term) {
          try {
            const entry: Entry = {
              resource: {
                resourceType: 'Parameters',
                parameter: [
                  {
                    name: 'source',
                    valueUri: 'http://ahdis.ch/fhir/mappingtutorial/qr2pat2',
                  },
                  {
                    name: 'content',
                    resource: {
                      resourceType: 'QuestionnaireResponse',
                      status: 'in-progress',
                    },
                  },
                  {
                    name: 'map',
                    valueString: term,
                  },
                ],
              },
            };
            // fhirHttpService.transform(entry).then(response => {
            //   this.mapResult = response.data;
            // });
          } catch (e) {
            console.log(e);
            this.mapResult = undefined;
          }
        } else {
          this.mapResult = undefined;
        }
      });
  }

  ngOnInit() {}

  fileChange(event) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsText(file);
      reader.onload = () => {
        this.resource = JSON.parse(<string>reader.result);
        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
      };
    }
  }
}
