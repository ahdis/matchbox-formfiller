import { Component, OnInit, Input } from '@angular/core';
import { QuestionnaireFillerService } from '../../questionnaire-filler.service';

@Component({
  selector: 'app-item-hint',
  templateUrl: './item-hint.component.html',
  styleUrls: ['./item-hint.component.scss'],
})
export class ItemHintComponent implements OnInit {
  @Input() item: fhir.r4.QuestionnaireItem;

  constructor(private questionaireFillerServer: QuestionnaireFillerService) {}

  ngOnInit() {}

  getSupportLink() {
    if (this.item) {
      const xhtmlExtension = this.questionaireFillerServer.getExtension(
        this.item.extension,
        'http://hl7.org/fhir/StructureDefinition/questionnaire-supportLink'
      );
      if (xhtmlExtension) {
        return xhtmlExtension.valueUri;
      }
    }
  }
}
