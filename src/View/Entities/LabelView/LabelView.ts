import {Label} from "../../../Store/Label";
import {TopContextUser} from "../Line/TopContext/TopContextUser";
import {SVGNS} from "../../../Infrastructure/SVGNS";
import {TopContext} from "../Line/TopContext/TopContext";
import {View} from "../../View";
import {Line} from "../Line/Line";
import {Base} from "../../../Infrastructure/Repository";
import {addAlpha} from "../../../Infrastructure/Color";
import "@mdi/font/css/materialdesignicons.css";

export namespace LabelView {
    export interface Config {
        readonly labelPadding: number,
        readonly bracketWidth: number,
        readonly labelWidthCalcMethod: "max" | "label",
        readonly labelClasses: Array<string>;
    }

    export class Entity extends TopContextUser {
        layer: number = 0;
        private svgElement: SVGGElement = null as any;

        constructor(
            readonly store: Label.Entity,
            private contextIn: TopContext,
            private config: Config) {
            super();
        }

        get id(): number {
            return this.store.id;
        }

        get lineIn(): Line.ValueObject {
            return this.contextIn.belongTo;
        }

        get view(): View {
            return this.lineIn.view;
        }

        get highLightWidth(): number {
            return this.view.contentWidth(this.store.startIndex, this.store.endIndex);
        }

        get highLightLeft() {
            return this.view.contentWidth(this.lineIn.startIndex, this.store.startIndex)
                + /*text element's margin*/this.lineIn.view.paddingLeft;
        }

        get middle() {
            return this.highLightLeft + this.highLightWidth / 2;
        }

        get labelLeft() {
            return this.middle - this.labelWidth / 2;
        }

        get labelRight() {
            return this.middle + this.labelWidth / 2;
        }

        get labelWidth() {
            return this.view.labelFont.widthOf(this.store.category.text) + this.config.labelPadding + 2;
        }

        get left() {
            if (this.config.labelWidthCalcMethod === "max") {
                return this.labelWidth > this.highLightWidth ? this.labelLeft : this.highLightLeft;
            } else {
                return this.labelLeft;
            }
        }

        get width() {
            if (this.config.labelWidthCalcMethod === "max") {
                return this.labelWidth > (this.highLightWidth - 1) ? this.labelWidth : (this.highLightWidth - 1);
            } else {
                return this.labelWidth;
            }
        }

        render(): SVGGElement {
            this.svgElement = document.createElementNS(SVGNS, 'g') as SVGGElement;
            this.svgElement.classList.add(...this.config.labelClasses);
            const highLightElement = this.createHighLightElement();
            const annotationBtnElement = this.createAnnotationBtnElement();
            const y = this.view.topContextLayerHeight * (this.layer - 1);
            this.svgElement.appendChild(highLightElement);
            this.svgElement.appendChild(annotationBtnElement);
            return this.svgElement;
        }

        update() {
            this.svgElement.style.transform = `translate(${this.highLightLeft}px,${this.lineIn.y}px)`;
        }

        remove() {
            this.svgElement.remove();
        }

        private createHighLightElement() {
            const highLightElement = document.createElementNS(SVGNS, 'rect') as SVGRectElement;
            const color = this.store.category.color;
            highLightElement.setAttribute('height', this.lineIn.view.contentFont.lineHeight.toString());
            highLightElement.setAttribute('width', this.highLightWidth.toString());
            highLightElement.setAttribute('fill', /^#/g.test(color) ? addAlpha(color, 70) : color);
            return highLightElement;
        }

        private createAnnotationBtnElement(){
            const annotationBtnElement = document.createElementNS(SVGNS, 'svg') as SVGElement;
            const PathElement = document.createElementNS(SVGNS, 'path') as SVGPathElement;
            const RectElement = document.createElementNS(SVGNS, 'rect') as SVGRectElement;
            annotationBtnElement.setAttribute('xmlns','http://www.w3.org/2000/svg');
            annotationBtnElement.setAttribute('xmlns:xlink','http://www.w3.org/1999/xlink');
            annotationBtnElement.setAttribute('aria-hidden','true');
            annotationBtnElement.setAttribute('focusable','false');
            annotationBtnElement.setAttribute('x','-10');
            annotationBtnElement.setAttribute('y','-10');
            annotationBtnElement.setAttribute('width','1em');
            annotationBtnElement.setAttribute('height','1em');
            annotationBtnElement.setAttribute('style','-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);');
            annotationBtnElement.setAttribute('preserveAspectRatio','xMidYMid meet');
            annotationBtnElement.setAttribute('viewBox','0 0 24 24')
            PathElement.setAttribute('d','M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7z');
            PathElement.setAttribute('fill','#626262');
            RectElement.setAttribute('width','24px');
            RectElement.setAttribute('height','24px');
            RectElement.setAttribute('fill','rgba(0, 0, 0, 0)');
            annotationBtnElement.onclick = (event: MouseEvent) => {
                this.view.root.emit('buttonClicked', this.id, event);
            };
            annotationBtnElement.appendChild(PathElement);
            annotationBtnElement.appendChild(RectElement);
            /*
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
            <path d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7z" fill="#626262"/>
            <rect x="0" y="0" width="24" height="24" fill="rgba(0, 0, 0, 0)" />
            </svg>
            */
            return annotationBtnElement;
        }
    }

    export class Repository extends Base.Repository<Entity> {
        get(key: number): LabelView.Entity {
            return this.entities.get(key)!;
        }
    }
}
