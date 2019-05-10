/// <reference path="../.,/../../../fhir.r4/index.d.ts" />

import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit, SecurityContext, Input } from '@angular/core';
import { QuestionnaireFillerService } from '../../questionnaire-filler.service';

@Component({
  selector: 'app-item-label',
  templateUrl: './item-label.component.html',
  styleUrls: ['./item-label.component.scss'],
})
export class ItemLabelComponent implements OnInit {
  @Input() item: fhir.r4.QuestionnaireItem;

  constructor(
    private questionaireFillerServer: QuestionnaireFillerService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {}

  getPrefix(): string {
    if (this.item._prefix) {
      const xhtmlExtension = this.questionaireFillerServer.getExtension(
        this.item._prefix.extension,
        'http://hl7.org/fhir/StructureDefinition/rendering-xhtml'
      );
      if (xhtmlExtension) {
        return this.sanitizer.sanitize(
          SecurityContext.HTML,
          xhtmlExtension.valueString
        );
      }
    }
    return this.item.prefix;
  }

  getPrefixStyles(): Object {
    if (this.item._prefix) {
      return this.questionaireFillerServer.getCss(
        this.questionaireFillerServer.getExtension(
          this.item._prefix.extension,
          'http://hl7.org/fhir/StructureDefinition/rendering-style'
        )
      );
    }
    return {};
  }

  getText(): string {
    if (this.item._text) {
      const xhtmlExtension = this.questionaireFillerServer.getExtension(
        this.item._text.extension,
        'http://hl7.org/fhir/StructureDefinition/rendering-xhtml'
      );
      if (xhtmlExtension) {
        return this.sanitizer.sanitize(
          SecurityContext.HTML,
          xhtmlExtension.valueString
        );
      }
    }
    return this.item.text;
  }

  getTextStyles(): Object {
    if (this.item._text) {
      return this.questionaireFillerServer.getCss(
        this.questionaireFillerServer.getExtension(
          this.item._text.extension,
          'http://hl7.org/fhir/StructureDefinition/rendering-style'
        )
      );
    }
    return {};
  }
}
