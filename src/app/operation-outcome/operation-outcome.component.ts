import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as ace from 'ace-builds';

@Component({
  selector: 'app-operation-outcome',
  templateUrl: './operation-outcome.component.html',
  styleUrls: ['./operation-outcome.component.scss'],
})
export class OperationOutcomeComponent implements AfterViewInit, OnInit {
  @Input() title: string;
  @Input() json: string;
  @Input() operationOutcome: fhir.r4.OperationOutcome;

  @ViewChild('editor') private editor: ElementRef<HTMLElement>;

  jsonLines: string[];
  padNo: number;

  aceEditor: ace.Ace.Editor;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    ace.config.set('fontSize', '11px');
    ace.config.set(
      'basePath',
      'https://unpkg.com/ace-builds@1.4.12/src-noconflict'
    );
    this.aceEditor = ace.edit(this.editor.nativeElement);
    this.aceEditor.setOption('useWorker', false);
    this.aceEditor.setTheme('ace/theme/chrome');
    this.aceEditor.session.setMode('ace/mode/json');
    this.aceEditor.session.setValue(this.json);
    this.aceEditor.setReadOnly(true);
    this.aceEditor.on('change', () => {
      console.log(this.aceEditor.getValue());
    });
    this.operationOutcome.issue?.sort(
      (issue1, issue2) => this.getLineNo(issue1) - this.getLineNo(issue2)
    );
    this.operationOutcome.issue?.forEach((issue) =>
      this.aceEditor
        .getSession()
        .addMarker(
          new ace.Range(
            this.getLineNo(issue) - 1,
            0,
            this.getLineNo(issue) - 1,
            1
          ),
          this.getLineAceClass(issue),
          'fullLine',
          true
        )
    );
    const annotations: ace.Ace.Annotation[] = [];
    this.operationOutcome.issue?.forEach((issue) =>
      annotations.push({
        row: this.getLineNo(issue) - 1,
        column: 0,
        text: issue.diagnostics, // Or the Json reply from the parser
        type: this.getErrorType(issue), // also "warning" and "information"
      })
    );
    this.aceEditor.session.setAnnotations(annotations);
  }

  getErrorType(issue: fhir.r4.OperationOutcomeIssue): string {
    switch (issue.severity) {
      case 'fatal':
      case 'error':
        return 'error';
      case 'warning':
      case 'information':
        return 'warning';
      //      case 'information': does not show
      //        return 'information'
    }
    return '';
  }

  getJson(): String {
    return this.json;
  }

  getLineAceClass(issue: fhir.r4.OperationOutcomeIssue): string {
    return 'ace-highlight-' + issue?.severity;
  }

  getLineNo(issue: fhir.r4.OperationOutcomeIssue): number {
    if (issue.extension?.length > 0) {
      return issue.extension[0].valueInteger;
    }
    return 0;
  }

  getLineFromExtension(issue: fhir.r4.OperationOutcomeIssue): string {
    if (issue.extension?.length > 0) {
      return 'L' + issue.extension[0].valueInteger;
    }
    return '';
  }

  getLocation(issue: fhir.r4.OperationOutcomeIssue): string {
    if (issue.location?.length > 0) {
      return issue.location[0];
    }
    return '';
  }

  scroll(line: number) {
    line -= 1;
    if (line < 0) {
      line = 0;
    }
    this.aceEditor.scrollToLine(line, false, true, null);
  }
}
