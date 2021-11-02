import { Component, Input, OnInit } from '@angular/core';
import { FhirPathService } from 'ng-fhirjs';

@Component({
  selector: 'app-imaging-study-table',
  templateUrl: './imaging-study-table.component.html',
  styleUrls: ['./imaging-study-table.component.scss'],
})
export class ImagingStudyTableComponent implements OnInit {
  @Input() imagingStudy: fhir.r4.ImagingStudy;

  constructor(private fhirPathService: FhirPathService) {}

  ngOnInit(): void {}

  getUid(): string {
    return this.fhirPathService.evaluateToString(
      this.imagingStudy,
      "identifier.where(system='urn:dicom:uid').value"
    );
  }

  getAcsn(): string {
    return this.fhirPathService.evaluateToString(
      this.imagingStudy,
      "identifier.where(type.where(coding.where(system='http://terminology.hl7.org/CodeSystem/v2-0203' and code='ACSN'))).value"
    );
  }
}
