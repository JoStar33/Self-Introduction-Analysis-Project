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
            //Label.Entity는 라벨의 구성요소.
            readonly store: Label.Entity,
            private contextIn: TopContext,
            private config: Config,
            private checkOverLine: Boolean
        ) 
        {
            super();
        }

        get id(): number {
            return this.store.id;
        }

        get lineIn(): Line.ValueObject {
            //contextIn은 TopContext
            //TopContext내부의 라인값을 가지고온다.
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
            //라벨의 left와 right를 구하기 위한 값.
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
            //checkOverLine에 따라서 라벨링을 다르게 진행. checkOverLine이 true라면 라인이 길기에 넘겨서 그린다는 의미로 삭제 버튼을 생성하지 않는다.
            //처음에는 g로 요소들을 감산다. 라벨도 엄밀히 말하면 highLightElement, annotationBtnElement같은 요소들을 가지기때문에 g로 되어있는것.
            this.svgElement = document.createElementNS(SVGNS, 'g') as SVGGElement;
            this.svgElement.classList.add(...this.config.labelClasses);
            if(this.checkOverLine){ //라인을 넘겼다면
                const highLightElement = this.createHighLightElement();
                const y = this.view.topContextLayerHeight * (this.layer - 1);
                this.svgElement.appendChild(highLightElement);
            }
            else{//그게 아니라면
                const highLightElement = this.createHighLightElement();
                const annotationBtnElement = this.createAnnotationBtnElement();
                const y = this.view.topContextLayerHeight * (this.layer - 1);
                this.svgElement.appendChild(highLightElement);
                this.svgElement.appendChild(annotationBtnElement);
            }
            return this.svgElement;
        }

        update() {
            //transform:translate(-10px, -10px); X축으로 -10px, Y축으로 -10px 이동.
            //즉 X축으로 this.highLightLeft만큼 Y축으로 this.lineIn.y만큼 이동한다.
            this.svgElement.style.transform = `translate(${this.highLightLeft}px,${this.lineIn.y}px)`;
        }

        remove() {
            this.svgElement.remove();
        }

        //하이라이트된 라벨을 그려주는 함수
        private createHighLightElement() {
            const highLightElement = document.createElementNS(SVGNS, 'rect') as SVGRectElement;
            const color = this.store.category.color;
            highLightElement.setAttribute('height', this.lineIn.view.contentFont.lineHeight.toString());
            highLightElement.setAttribute('width', this.highLightWidth.toString());
            highLightElement.setAttribute('fill', /^#/g.test(color) ? addAlpha(color, 70) : color);
            return highLightElement;
        }

        //삭제버튼을 그려주는 함수
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
            //삭제버튼에 이벤트를 부여
            annotationBtnElement.onclick = (event: MouseEvent) => {
                this.view.root.emit('buttonClicked', this.id, event);
            };
            annotationBtnElement.appendChild(PathElement);
            annotationBtnElement.appendChild(RectElement);
            /* 해당 삭제버튼의 HTML원본.
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
            <path d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7z" fill="#626262"/>
            <rect x="0" y="0" width="24" height="24" fill="rgba(0, 0, 0, 0)" />
            </svg>
            */
            return annotationBtnElement;
        }
    }

    //키값과 일치하는 요소를 가지고와서 사용한다.
    export class Repository extends Base.Repository<Entity> {
        get(key: number): LabelView.Entity {
            return this.entities.get(key)!;
        }

        //getAll을 만든 이유는, Label이 줄이 길어서 넘겼을 경우, 넘긴 라벨들까지 가지고 오기 위해서 만들게 되었음.
        getAll(key: number): Array<LabelView.Entity> {
            let result = [];
            //이부분이 다소 문제...사이즈를 엄청 늘리긴했는디...아무튼 문제.
            //사이즈 크기문제로 값을 못가져오는 경우가 있기때문에 이를 해결하고자 값의 크기를 다소 무식하게 늘렸다. *3까지 했기때문에 오류가 생기지는 않을거라 믿음.
            //하지만 따지고보면 하드코딩된것과 다를바가 없기 때문에 다른 방법을 모색하긴 해야함.
            for (let i = 0; i < this.entities.size * 3; i++) {
                if(this.entities.get(i) !== undefined){
                    if(this.entities.get(i).id === key){
                        result.push(this.entities.get(i));
                    }
                }
            }
            return result;
        }
    }
}
