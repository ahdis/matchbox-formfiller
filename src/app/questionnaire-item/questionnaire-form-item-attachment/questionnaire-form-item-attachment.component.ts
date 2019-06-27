import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { addAnswer, removeAnswer } from '../store/action';
import { Action, FormItem } from '../types';

@Component({
  selector: 'app-questionnaire-form-item-attachment',
  templateUrl: './questionnaire-form-item-attachment.component.html',
  styleUrls: ['./questionnaire-form-item-attachment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireFormItemAttachmentComponent {
  @Input() linkIdPath: string[];
  @Input() dispatch: (action: Action) => void;
  @Input() set formItem(item: FormItem) {
    this.item = item;
  }

  item: FormItem;
  dragCounter = 0;

  onDrop(ev) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    this.dragCounter = 0;

    const files = ev.target.files || ev.dataTransfer.items;

    if (files) {
      for (var i = 0; i < files.length; i++) {
        // If dropped items aren't files, reject them
        if (files[i].kind === undefined || files[i].kind === 'file') {
          var file = files[i].getAsFile ? files[i].getAsFile() : files[i];
          this.getBase64(file).then((encodedData: string) => {
            const attachment: fhir.r4.Attachment = {
              size: file.size,
              title: file.name,
              contentType: file.type,
              data: encodedData,
            };
            this.dispatch(addAnswer(this.linkIdPath, attachment));
          });
        }
      }
    }
  }

  removeAttachment(index: number) {
    this.dispatch(removeAnswer(this.linkIdPath, index));
  }

  onDragOver(ev: DragEvent) {
    ev.preventDefault();
  }

  onDragEnter() {
    this.dragCounter++;
  }

  onDragLeave() {
    this.dragCounter--;
  }

  private getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
}
