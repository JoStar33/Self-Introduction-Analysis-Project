import {Store} from "../Store/Store";
import {SVGNS} from "../Infrastructure/SVGNS";
import {Line} from "./Entities/Line/Line";
import {Font} from "./Font";
import {LabelView} from "./Entities/LabelView/LabelView";
import {Annotator} from "../Annotator";
import {Label} from "../Store/Label";
import {ContentEditor} from "./Entities/ContentEditor/ContentEditor";
import {some} from "../Infrastructure/Option";

export interface Config extends LabelView.Config {
    readonly contentClasses: Array<string>;
    // svg barely support anything!
    // we don't have lineHeight, padding, border-box, etc
    // bad for it
    readonly lineHeight: number;
    readonly topContextMargin: number;
    // todo: merge this into store.labelCategory.color
    readonly labelOpacity: number;
    readonly contentEditable: boolean;
}

export class View {
    readonly contentFont: Font.ValueObject;
    readonly labelFont: Font.ValueObject;
    readonly topContextLayerHeight: number;
    readonly textElement: SVGTextElement;
    readonly lines: Array<Line.ValueObject>;
    readonly lineMaxWidth: number;
    readonly labelViewRepository: LabelView.Repository;
    readonly store: Store;

    readonly contentEditor: ContentEditor = null as any;

    constructor(
        readonly root: Annotator,
        readonly svgElement: SVGSVGElement,
        readonly config: Config
    ) {

        this.store = root.store;
        this.labelViewRepository = new LabelView.Repository();
        //svgElement.style.width = "1500";
        this.textElement = document.createElementNS(SVGNS, 'text') as SVGTextElement;
        this.textElement.style.alignmentBaseline = "middle";
        this.textElement.style.wordWrap = "normal";
        this.textElement.style.whiteSpace="pre"

        this.svgElement.appendChild(this.textElement);
        const labelText = Array.from(this.store.labelCategoryRepo.values()).map(it => it.text).join('');
        [this.contentFont, this.labelFont] = Font.Factory.startBatch(svgElement, this.textElement)
            .thanCreate(config.contentClasses, this.store.content)
            .thanCreate(config.labelClasses, labelText)
            .endBatch();
        this.topContextLayerHeight = config.topContextMargin; //이부분 수정해서 카테고리 마진문제 해결
        this.textElement.classList.add(...config.contentClasses);
        this.lineMaxWidth = svgElement.width.baseVal.value - 2 * this.paddingLeft;
        this.lines = Line.Service.divide(this, 0, this.store.content.length);
        this.lines.map(this.constructLabelViewsForLine.bind(this));
        const tspans = this.lines.map(it => it.render());
        this.textElement.append(...tspans);
        this.svgElement.style.height = this.height.toString() +'px';
        //텍스트 마진문제 해결
        this.svgElement.setAttribute('viewBox','0 -20 '+ (svgElement.width.baseVal.value)+' '+ (this.height+30).toString());
        this.registerEventHandlers();
        if (this.config.contentEditable) {
            this.contentEditor = new ContentEditor(this);
            let [cursor, textArea] = this.contentEditor.render();
            this.svgElement.appendChild(cursor);
            this.svgElement.parentNode!.insertBefore(textArea, this.svgElement);
        }
        this.svgElement.appendChild(this.collectStyle());
    }

    private static layoutTopContextsAfter(currentLine: Line.ValueObject) {
        while (currentLine.next.isSome) {
            currentLine.topContext.update();
            currentLine = currentLine.next.toNullable()!;
        }
        currentLine.topContext.update();
    }

    private constructLabelViewsForLine(line: Line.ValueObject): Array<LabelView.Entity> {
        const labels = this.store.labelRepo.getEntitiesInRange(line.startIndex, line.endIndex);
        const labelViews = labels.map(it => new LabelView.Entity(it, line.topContext, this.config));
        labelViews.map(it => this.labelViewRepository.add(it));
        labelViews.map(it => line.topContext.addChild(it));
        return labelViews;
    }


    private get height() {
        return this.lines.reduce((currentValue, line) => currentValue + line.height + this.contentFont.fontSize * (this.config.lineHeight - 1), 20);
    }

    static createMarkerElement(): SVGMarkerElement {
        const markerArrow = document.createElementNS(SVGNS, 'path');
        markerArrow.setAttribute('d', "M0,4 L0,8 L6,6 L0,4 L0,8");
        markerArrow.setAttribute("stroke", "#000000");
        markerArrow.setAttribute("fill", "#000000");
        const markerElement = document.createElementNS(SVGNS, 'marker');
        markerElement.setAttribute('id', 'marker-arrow');
        markerElement.setAttribute('markerWidth', '8');
        markerElement.setAttribute('markerHeight', '10');
        markerElement.setAttribute('orient', 'auto');
        markerElement.setAttribute('refX', '5');
        markerElement.setAttribute('refY', '6');
        markerElement.appendChild(markerArrow);
        return markerElement;
    };

    public contentWidth(startIndex: number, endIndex: number): number {
        return this.contentFont.widthOf(this.store.contentSlice(startIndex, endIndex));
    }

    private removeLine(line: Line.ValueObject) {
        line.remove();
        line.topContext.children.forEach(it => {
            if (it instanceof LabelView.Entity) {
                this.labelViewRepository.delete(it);
            }
        });
    }

    private registerEventHandlers() {
        this.textElement.onmouseup = (e) => {
            if (window.getSelection()!.type === "Range") {
                this.root.textSelectionHandler.textSelected();
            } else {
                if (this.config.contentEditable)
                    this.contentEditor.caretChanged(e.clientY);
            }
        };
        this.store.labelRepo.on('created', this.onLabelCreated.bind(this));
        this.store.labelRepo.on('removed', (label: Label.Entity) => {
            let viewEntity = this.labelViewRepository.get(label.id!);
            viewEntity.lineIn.topContext.removeChild(viewEntity);
            viewEntity.remove();
            this.labelViewRepository.delete(viewEntity);
            viewEntity.lineIn.topContext.update();
            viewEntity.lineIn.update();
            View.layoutTopContextsAfter(viewEntity.lineIn);
            if (this.config.contentEditable)
                this.contentEditor.update();
        });

        if (this.config.contentEditable) {
            this.store.on('contentSpliced', this.onContentSpliced.bind(this));
        }
    }

    private rerenderLines(beginLineIndex: number, endInLineIndex: number) {
        const parent = this.lines[0].svgElement.parentElement as any as SVGTextElement;
        for (let i = beginLineIndex; i <= endInLineIndex; ++i) {
            this.removeLine(this.lines[i]);
        }
        const begin = this.lines[beginLineIndex];
        const endIn = this.lines[endInLineIndex];
        const newDividedLines = Line.Service.divide(this, begin.startIndex, endIn.endIndex);
        if (newDividedLines.length !== 0) {
            newDividedLines[0].last = begin.last;
            begin.last.map(it => it.next = some(newDividedLines[0]));
            newDividedLines[newDividedLines.length - 1].next = endIn.next;
            endIn.next.map(it => it.last = some(newDividedLines[newDividedLines.length - 1]));
            this.lines.splice(beginLineIndex, endInLineIndex - beginLineIndex + 1, ...newDividedLines);
            if (beginLineIndex === 0) {
                if (!endIn.next.isSome) {
                    newDividedLines[0].insertInto(parent);
                } else {
                    newDividedLines[0].insertBefore(endIn.next);
                }
            } else {
                newDividedLines[0].insertAfter(begin.last);
            }
        }
        for (let i = 1; i < newDividedLines.length; ++i) {
            newDividedLines[i].insertAfter(some(newDividedLines[i - 1]));
        }
        for (let line of newDividedLines) {
            let labelViews = this.constructLabelViewsForLine(line);
            labelViews.map(it => line.topContext.renderChild(it));
        }
        for (let line of newDividedLines) {
            line.update();
            line.topContext.update();
        }
    }

    private onLabelCreated(label: Label.Entity) {
        let [startInLineIndex, endInLineIndex] = this.findRangeInLines(label.startIndex, label.endIndex);
        // in one line
        if (endInLineIndex === startInLineIndex + 1) {
            const line = this.lines[startInLineIndex];
            const labelView = new LabelView.Entity(label, line.topContext, this.config);
            this.labelViewRepository.add(labelView);
            line.topContext.addChild(labelView);
            line.topContext.renderChild(labelView);
            line.topContext.update();
            line.update();
        } else {
            // in many lines
            let hardLineEndInIndex = this.findHardLineEndsInIndex(startInLineIndex);
            this.rerenderLines(startInLineIndex, hardLineEndInIndex);
        }
        View.layoutTopContextsAfter(this.lines[startInLineIndex]);
        if (this.config.contentEditable)
            this.contentEditor.update();
        this.svgElement.style.height = this.height.toString() + 'px';
    }

    private findRangeInLines(startIndex: number, endIndex: number) {
        let startInLineIndex: number = 0;
        let endInLineIndex: number = 0;
        this.lines.forEach((line: Line.ValueObject, index: number) => {
            if (line.startIndex <= startIndex && startIndex < line.endIndex) {
                startInLineIndex = index;
            }
            if (line.startIndex <= endIndex - 1 && endIndex - 1 < line.endIndex) {
                endInLineIndex = index + 1;
            }
        });
        return [startInLineIndex, endInLineIndex];
    }


    // todo: unit test
    private onContentSpliced(startIndex: number, removed: string, inserted: string) {
        if (removed !== "")
            this.onRemoved(startIndex, removed);
        if (inserted !== "")
            this.onInserted(startIndex, inserted);
    }

    private onRemoved(startIndex: number, removed: string) {
        let [startInLineIndex, _] = this.findRangeInLines(startIndex, startIndex + 1);
        if (this.lines[startInLineIndex].startIndex === startIndex - removed.length) {
            this.lines[startInLineIndex].move(-removed.length);
        } else {
            this.lines[startInLineIndex].inserted(-removed.length);
        }
        let currentLineIndex = startInLineIndex + 1;
        while (currentLineIndex < this.lines.length) {
            this.lines[currentLineIndex].move(-removed.length);
            ++currentLineIndex;
        }
        let hardLineEndInIndex = this.findHardLineEndsInIndex(startInLineIndex);

        if (removed === "\n" && this.lines[startInLineIndex].isBlank) {
            let last = this.lines[startInLineIndex].last;
            let next = this.lines[startInLineIndex].next;
            this.lines[startInLineIndex].remove();
            this.lines.splice(startInLineIndex, 1);
            last.map(it => it.next = next);
            next.map(it => it.last = last);
        } else {
            this.rerenderLines(startInLineIndex, hardLineEndInIndex);
        }
        View.layoutTopContextsAfter(this.lines[hardLineEndInIndex - 1]);
        const asArray = Array.from(removed);
        const removedLineCount = asArray.filter(it => it === "\n").length;
        if (removedLineCount === 0) {
            this.contentEditor.characterIndex -= removed.length;
            this.contentEditor.avoidInLabel("forward");
        } else {
            if (this.contentEditor.lineIndex - removedLineCount >= 0) {
                this.contentEditor.lineIndex -= removedLineCount;
                this.contentEditor.characterIndex = this.contentEditor.line.content.length;
                this.contentEditor.avoidInLabel("forward");
            }
        }
        this.contentEditor.update();
        this.svgElement.style.height = this.height.toString() + 'px';
    }

    //줄넘기는 부분
    private onInserted(startIndex: number, inserted: string) {
        let [startInLineIndex, _] = this.findRangeInLines(startIndex, startIndex + 1);
        if (this.lines[startInLineIndex].startIndex === startIndex + inserted.length) {
            this.lines[startInLineIndex].move(inserted.length);
        } else {
            this.lines[startInLineIndex].inserted(inserted.length);
        }
        let currentLineIndex = startInLineIndex + 1;
        while (currentLineIndex < this.lines.length) {
            this.lines[currentLineIndex].move(inserted.length);
            ++currentLineIndex;
        }
        let hardLineEndInIndex = this.findHardLineEndsInIndex(startInLineIndex);
        this.rerenderLines(startInLineIndex, hardLineEndInIndex);
        View.layoutTopContextsAfter(this.lines[hardLineEndInIndex]);
        const asArray = Array.from(inserted);
        const newLineCount = asArray.filter(it => it === "\n").length;
        const lastNewLineIndex = asArray.lastIndexOf("\n");
        const afterLastNewLine = inserted.length - lastNewLineIndex;
        if (newLineCount === 0) {
            this.contentEditor.characterIndex += inserted.length;
            this.contentEditor.avoidInLabel("forward");
        } else {
            this.contentEditor.lineIndex += newLineCount;
            this.contentEditor.characterIndex = afterLastNewLine - 1;
            this.contentEditor.avoidInLabel("forward");
        }
        this.contentEditor.update();
        this.svgElement.style.height = this.height.toString() + 'px';
    }

    private findHardLineEndsInIndex(startInLineIndex: number) {
        let hardLineEndInIndex: number;
        for (hardLineEndInIndex = startInLineIndex;
             hardLineEndInIndex < this.lines.length - 1 && !this.lines[hardLineEndInIndex].endWithHardLineBreak;
             ++hardLineEndInIndex) {
        }
        return hardLineEndInIndex;
    }

    private collectStyle(): SVGStyleElement {
        const element = document.createElementNS(SVGNS, "style");
        const textClassSelector = this.config.contentClasses.map(it => "." + it)
            .join(',');
        // F*** SVG's LINE HEIGHT
        //
        // When you need it,
        // No affect it takes.
        // When you don't need it,
        // It makes things in a mess.
        // What is it?
        // line-height in <svg>s.
        const textStyle = `
        ${textClassSelector} {
            font-family: ${this.contentFont.fontFamily};
            font-weight: ${this.contentFont.fontWeight};
            font-size: ${this.contentFont.fontSize}px;
            line-height: ${this.contentFont.lineHeight}px;
        }
        `;
        const labelClassSelector = this.config.labelClasses.map(it => "." + it)
            .join(',');
        const labelStyle = `
        ${labelClassSelector} {
            font-family: ${this.labelFont.fontFamily};
            font-weight: ${this.labelFont.fontWeight};
            font-size: ${this.labelFont.fontSize}px;
        }
        `;

        element.innerHTML = textStyle + labelStyle;
        return element;
    }

    get paddingLeft(): number {
        return Math.max(...Array.from(this.store.labelCategoryRepo.values())
            .map(it => this.labelFont.widthOf(it.text))) / 2 + 1/* stroke */;
    }
}
