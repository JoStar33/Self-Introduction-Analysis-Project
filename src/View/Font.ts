//                                  top        ___________________
//        /\                                    |               |
//       /  \                                   |               |
//      /____\                             topToBaseLine        |
//     /      \     \   /                       |            fontSize
//    /        \     \ /          baseLine     _|_              |
//                    /                                         |
//                   /             bottom      _________________|_
//    |--width--|  |width|
//
import {SVGNS} from "../Infrastructure/SVGNS";

export namespace Font {
    export class ValueObject {
        // it's really sad that in svg 1.1, I cannot set <text> in svg's
        // line-height directly to 100%, which can make
        // fontSize === lineHeight forever
        // which makes lineHeight necessary
        // and <text> in svg is fixed to box-sizing: content-box;
        // when render with dy=0
        // <text>'s **baseline**'s y is 0
        // for making <text>'s topY=0
        // topToBaseLine distance is necessary
        constructor(readonly fontFamily: string,
                    readonly fontSize: number,
                    readonly fontWeight: string,
                    readonly lineHeight: number,
                    readonly topToBaseLine: number,
                    readonly width: Map<string, number>) {
        }

        widthOf(text: Array<string> | string): number {
            if (typeof text === "string") {
                return this.widthOf(Array.from(text));
            } else {
                //map() 메서드는 배열 내의 모든 요소 각각에 대하여 주어진 함수를 호출한 결과를 모아 새로운 배열을 반환합니다.
                //TypeScript에서 접두사 !는 식 유형에서 null와 undefined를 제거합니다.
                return text.map(it => this.width.get(it)!)
                    .reduce((a: number, b: number) => a + b, 0)
                    //배열내에 모든값 합산.
            }
        }
    }

    export namespace Factory {
        export function create(
            characters: string,
            testRenderElement: SVGTSpanElement,
            baseLineReferenceElement: SVGRectElement
        ): ValueObject {
            const width = new Map();
            const characterSet = new Set(characters);
            characterSet.delete('\n');
            const characterArray = Array.from(characterSet);
            testRenderElement.textContent = characterArray.join('');
            testRenderElement.parentNode!.parentNode!.insertBefore(baseLineReferenceElement, testRenderElement.parentNode);
            characterArray.forEach((ch: string, index: number) => {
                width.set(ch, testRenderElement.getExtentOfChar(index).width);
            });
            /*
            getBoundingClientRect는 요소의 다양한 값을 가지는 함수인데 해당 값을 통해 요소의 다양한 값들을 반환하는 식이 아래이다.
            간단하게 예를들어서 
            const ele = document.querySelector('#test');
            const imgRect = ele.getBoundingClientRect();
            console(imgRect);
            //출력결과
            {
                bottom: 178
                height: 44
                left: 212.5
                right: 1092.5
                top: 134
                width: 880
                x: 212.5
                y: 134
            }
            를 통해 확인할수 있다.
            */
           //아래는 rect element의 요소들이다.
            const topToBaseLine = baseLineReferenceElement.getBoundingClientRect().top - testRenderElement.getBoundingClientRect().top;
            const fontSize = parseFloat(window.getComputedStyle(testRenderElement).fontSize);
            const fontFamily = window.getComputedStyle(testRenderElement).fontFamily;
            const fontWeight = window.getComputedStyle(testRenderElement).fontWeight;
            const lineHeight = testRenderElement.getBoundingClientRect().height;
            return new ValueObject(fontFamily, fontSize, fontWeight, lineHeight, topToBaseLine, width);
        }

        //일괄측정
        class BatchMeasurer {
            private readonly baseLineReferenceElement: SVGRectElement;
            private readonly measuringElement: SVGTSpanElement;
            private readonly result: Array<ValueObject>;

            constructor(
                private svgElement: SVGSVGElement,
                private textElement: SVGTextElement
            ) {
                this.baseLineReferenceElement = document.createElementNS(SVGNS, 'rect') as SVGRectElement;
                this.baseLineReferenceElement.setAttribute('width', '1px');
                this.baseLineReferenceElement.setAttribute('height', '1px');
                this.svgElement.appendChild(this.baseLineReferenceElement);

                this.measuringElement = document.createElementNS(SVGNS, 'tspan') as SVGTSpanElement;
                this.textElement.appendChild(this.measuringElement);
                this.result = [];
            }

            public thanCreate(classNames: Array<string>,
                              text: string): this {
                this.measuringElement.classList.add(...classNames);
                const font = create(text, this.measuringElement, this.baseLineReferenceElement);
                this.measuringElement.classList.remove(...classNames);
                this.result.push(font);
                return this;
            }

            endBatch(): Array<ValueObject> {
                this.baseLineReferenceElement.remove();
                this.measuringElement.remove();
                return this.result;
            }
        }

        export function startBatch(
            svgElement: SVGSVGElement,
            textElement: SVGTextElement,
        ): BatchMeasurer {
            return new BatchMeasurer(svgElement, textElement);
        }
    }

    export namespace Service {
        export function measureMore(font: ValueObject,
                                    text: string,
                                    classes: Array<string>,
                                    textElement: SVGTextElement
        ): ValueObject {
            const characterSet = new Set(text);
            characterSet.delete('\n');
            const characterArray = Array.from(characterSet)
                .filter(it => !font.width.has(it));
            if (characterArray.length > 0) {
                const testRenderElement = document.createElementNS(SVGNS, 'tspan');
                testRenderElement.classList.add(...classes);
                testRenderElement.textContent = characterArray.join('');
                textElement.appendChild(testRenderElement);
                characterArray.forEach((ch: string, index: number) => {
                    font.width.set(ch, testRenderElement.getExtentOfChar(index).width);
                });
                testRenderElement.remove();
            }
            return font;
        }
    }
}
