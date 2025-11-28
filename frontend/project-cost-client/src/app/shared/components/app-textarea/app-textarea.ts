import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ViewChild,
  ElementRef,
  signal,
  computed,
  effect,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './app-textarea.html',
  styleUrl: './app-textarea.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppTextarea),
      multi: true
    }
  ]
})
export class AppTextarea implements ControlValueAccessor, OnInit, OnDestroy {
  @ViewChild('textareaElement') textareaElement!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('editorElement') editorElement!: ElementRef<HTMLDivElement>;

  @Input() id: string = '';
  @Input() name: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() rows: number = 4;
  @Input() cols?: number;
  @Input() resize: 'none' | 'both' | 'horizontal' | 'vertical' | 'auto' = 'vertical';
  @Input() wrap: 'soft' | 'hard' | 'off' = 'soft';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() loading: boolean = false;
  @Input() minlength?: number;
  @Input() maxlength?: number;
  @Input() clearable: boolean = false;
  @Input() showCounter: boolean = false;
  @Input() hint: string = '';
  @Input() errorMessage: string = '';
  @Input() successMessage: string = '';
  @Input() class: string = '';
  @Input() width: string = '';
  @Input() debounceTime: number = 0;
  @Input() showToolbar: boolean = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() inputEvent = new EventEmitter<Event>();
  @Output() focusEvent = new EventEmitter<FocusEvent>();
  @Output() blurEvent = new EventEmitter<FocusEvent>();

  value = signal<string>('');
  isFocused = signal<boolean>(false);
  hasValue = computed(() => this.value() !== '');
  characterCount = computed(() => this.value().length);
  showClearButton = computed(() => this.clearable && this.hasValue() && !this.disabled);
  showColorPicker = signal<boolean>(false);
  showEmojiPicker = signal<boolean>(false);
  currentColor = signal<string>('#000000');

  // Common emojis
  emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '👍', '👎', '👌', '✌️', '🤞', '🤝', '👏', '🙌', '💪', '❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'];

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private inputSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    effect(() => {
      if (!this.id) {
        this.id = `app-textarea-${Math.random().toString(36).substring(2, 9)}`;
      }
    });
  }

  ngOnInit(): void {
    if (this.debounceTime > 0) {
      this.inputSubject
        .pipe(debounceTime(this.debounceTime), takeUntil(this.destroy$))
        .subscribe((value) => {
          this.emitValue(value);
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value.set(target.value);

    if (this.debounceTime > 0) {
      this.inputSubject.next(target.value);
    } else {
      this.emitValue(target.value);
    }

    this.inputEvent.emit(event);
  }

  onFocus(event: FocusEvent): void {
    this.isFocused.set(true);
    this.focusEvent.emit(event);
  }

  onBlur(event: FocusEvent): void {
    this.isFocused.set(false);
    this.onTouched();
    this.blurEvent.emit(event);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showToolbar) return;

    // Check for keyboard shortcuts (Ctrl/Cmd + key)
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'b':
          event.preventDefault();
          this.formatBold();
          break;
        case 'i':
          event.preventDefault();
          this.formatItalic();
          break;
        case 'u':
          event.preventDefault();
          this.formatUnderline();
          break;
        case 'k':
          event.preventDefault();
          this.insertLink();
          break;
      }
    }
  }

  onClearClick(): void {
    this.value.set('');
    this.emitValue('');
    this.textareaElement?.nativeElement.focus();
  }

  private emitValue(value: string): void {
    this.onChange(value);
    this.valueChange.emit(value);
  }

  getErrorMessage(): string {
    return this.errorMessage;
  }

  focus(): void {
    if (this.textareaElement) {
      this.textareaElement.nativeElement.focus();
    }
  }

  reset(): void {
    this.value.set('');
    this.emitValue('');
  }

  // ============================================
  // TOOLBAR FORMATTING METHODS
  // ============================================

  /**
   * Wraps selected text with formatting markers
   */
  private wrapSelectedText(prefix: string, suffix: string = prefix): void {
    const textarea = this.textareaElement?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    const newText = `${beforeText}${prefix}${selectedText}${suffix}${afterText}`;
    this.value.set(newText);
    this.emitValue(newText);

    // Restore selection after update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  }

  /**
   * Inserts text at cursor position
   */
  private insertAtCursor(text: string): void {
    const textarea = this.textareaElement?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    const newText = `${beforeText}${text}${afterText}`;
    this.value.set(newText);
    this.emitValue(newText);

    // Position cursor after inserted text
    setTimeout(() => {
      textarea.focus();
      const newPos = start + text.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }

  /**
   * Execute formatting command for rich text editor
   */
  private execCommand(command: string, value?: string): void {
    if (!this.showToolbar) {
      // Fallback for non-rich text mode
      return;
    }

    // Ensure the editor is focused before executing command
    const editor = this.editorElement?.nativeElement;
    if (!editor) return;

    editor.focus();
    document.execCommand(command, false, value);

    // Update value after command execution
    setTimeout(() => {
      this.updateValue();
    }, 0);
  }

  /**
   * Save cursor position in contenteditable
   */
  private saveCursorPosition(): { start: number; end: number } | null {
    const editor = this.editorElement?.nativeElement;
    if (!editor) return null;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editor);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    return {
      start: preCaretRange.toString().length,
      end: preCaretRange.toString().length
    };
  }

  /**
   * Restore cursor position in contenteditable
   */
  private restoreCursorPosition(position: { start: number; end: number } | null): void {
    if (!position) return;

    const editor = this.editorElement?.nativeElement;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection) return;

    let charCount = 0;
    const range = document.createRange();
    range.setStart(editor, 0);
    range.collapse(true);

    const nodeIterator = document.createNodeIterator(
      editor,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node: Node | null;
    let found = false;

    while ((node = nodeIterator.nextNode())) {
      const nodeLength = node.textContent?.length || 0;
      if (charCount + nodeLength >= position.start) {
        range.setStart(node, position.start - charCount);
        range.setEnd(node, position.start - charCount);
        found = true;
        break;
      }
      charCount += nodeLength;
    }

    if (found) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  /**
   * Update value from contenteditable div
   */
  updateValue(): void {
    if (this.showToolbar && this.editorElement) {
      const cursorPosition = this.saveCursorPosition();
      const html = this.editorElement.nativeElement.innerHTML;
      this.value.set(html);
      this.emitValue(html);

      // Restore cursor position after Angular updates the DOM
      setTimeout(() => {
        this.restoreCursorPosition(cursorPosition);
      }, 0);
    }
  }

  /**
   * Format text as bold
   */
  formatBold(): void {
    if (this.showToolbar) {
      this.execCommand('bold');
    } else {
      this.wrapSelectedText('**');
    }
  }

  /**
   * Format text as italic
   */
  formatItalic(): void {
    if (this.showToolbar) {
      this.execCommand('italic');
    } else {
      this.wrapSelectedText('_');
    }
  }

  /**
   * Format text as underline
   */
  formatUnderline(): void {
    if (this.showToolbar) {
      this.execCommand('underline');
    } else {
      this.wrapSelectedText('<u>', '</u>');
    }
  }

  /**
   * Align text left
   */
  alignLeft(): void {
    this.execCommand('justifyLeft');
  }

  /**
   * Align text center
   */
  alignCenter(): void {
    this.execCommand('justifyCenter');
  }

  /**
   * Align text right
   */
  alignRight(): void {
    this.execCommand('justifyRight');
  }

  /**
   * Insert a link
   */
  insertLink(): void {
    if (this.showToolbar) {
      const url = prompt('Enter URL:');
      if (url) {
        this.execCommand('createLink', url);
      }
    } else {
      const textarea = this.textareaElement?.nativeElement;
      if (!textarea) return;

      const selectedText = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
      );

      if (selectedText) {
        this.wrapSelectedText('[', '](url)');
      } else {
        this.insertAtCursor('[link text](url)');
      }
    }
  }

  /**
   * Insert bullet list
   */
  insertBulletList(): void {
    if (this.showToolbar) {
      this.execCommand('insertUnorderedList');
    } else {
      const textarea = this.textareaElement?.nativeElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
      const beforeText = textarea.value.substring(0, lineStart);
      const afterText = textarea.value.substring(lineStart);

      const newText = `${beforeText}• ${afterText}`;
      this.value.set(newText);
      this.emitValue(newText);

      setTimeout(() => {
        textarea.focus();
        const newPos = lineStart + 2;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    }
  }

  /**
   * Insert code block
   */
  insertCodeBlock(): void {
    if (this.showToolbar) {
      this.execCommand('formatBlock', 'pre');
    } else {
      this.wrapSelectedText('`');
    }
  }

  /**
   * Change text color
   */
  changeTextColor(color: string): void {
    this.currentColor.set(color);
    this.execCommand('foreColor', color);
    this.showColorPicker.set(false);
  }

  /**
   * Toggle color picker
   */
  toggleColorPicker(): void {
    this.showColorPicker.update(v => !v);
    this.showEmojiPicker.set(false);
  }

  /**
   * Toggle emoji picker
   */
  toggleEmojiPicker(): void {
    this.showEmojiPicker.update(v => !v);
    this.showColorPicker.set(false);
  }

  /**
   * Insert emoji
   */
  insertEmoji(emoji: string): void {
    if (this.showToolbar) {
      this.execCommand('insertText', emoji);
    } else {
      this.insertAtCursor(emoji);
    }
    this.showEmojiPicker.set(false);
  }

  /**
   * Insert image
   */
  insertImage(): void {
    const url = prompt('Enter image URL:');
    if (url) {
      this.execCommand('insertImage', url);
    }
  }

  /**
   * Undo last action
   */
  undo(): void {
    this.execCommand('undo');
  }

  /**
   * Redo last action
   */
  redo(): void {
    this.execCommand('redo');
  }
}
