//Option은 값이 있냐 없냐를 판별해준다.
import {none, Option, some} from "../../../Infrastructure/Option";
import {SVGNS} from "../../../Infrastructure/SVGNS";
import {View} from "../../View";
import {TopContext} from "./TopContext/TopContext";
import {takeWhile} from "../../../Infrastructure/Array";

//Line은 한줄. 즉 tspan을 의미.
export namespace Line {
    //Config(구성요소)중에서 lineHeight(라인높이)만 참고하겠다!
    export interface Config {
        readonly lineHeight: number
    }

    export class ValueObject {
        //TopContext는 한 라인에 들어가는 라벨들의 그룹.
        readonly topContext: TopContext;
        public svgElement: SVGTSpanElement = null as any;
        private readonly config: Config;

        constructor(
            //라인의 시작과 끝, start, end(아직까지는 추측.)
            startIndex: number,
            endIndex: number,
            public last: Option<ValueObject>,
            public next: Option<ValueObject>,
            readonly view: View
        ) {
            this._startIndex = startIndex;
            this._endIndex = endIndex;
            //한 라인에 대한 그룹을 하나 만들어준다.
            //이 라인에대한 그룹이라는걸 인지시켜주기 위해 Line.ValueObject를 넘겨준다.
            //topcontext가 그룹이라는점 유념.
            this.topContext = new TopContext(this);
            //view의 라인 높이값을 가져온다.
            this.config = view.config;
        }

        private _startIndex: number;

        get startIndex(): number {
            return this._startIndex;
        }

        private _endIndex: number;

        get endIndex(): number {
            return this._endIndex;
        }

        move(offset: number) {
            this._startIndex += offset;
            this._endIndex += offset;
        }

        //추측하건데 endIndex에 더하는걸 보니 줄을 늘리는 함수...?
        inserted(characterCount: number) {
            this._endIndex += characterCount;
        }

        //tspan이 위치해야할 좌표값을 구한다.
        get dy(): number {
            //null이 아닌값을 반환한다.
            return this.last.match(
                this.view.contentFont.fontSize * this.config.lineHeight,
                //this.view.contentFont.topToBaseLine은 baseLineReferenceElement.getBoundingClientRect().top - testRenderElement.getBoundingClientRect().top;로서
                //위에 비는공간(?)이라고 생각하면 된다.
                this.view.contentFont.topToBaseLine
                //마지막으로 라인이 위치해야하는 층과 그룹의 높이를 곱해서 위치를 지정해준다.
            ) + this.topContext.layer * this.view.topContextLayerHeight;
        }

        //높이를 구하는 함수. 위와 얼추 동일하기에 설명은 생략.
        get height(): number {
            return this.topContext.layer * this.view.topContextLayerHeight + this.view.contentFont.fontSize;
        }

        get y(): number {
            //takeWhile은 Array라는 타입스크립트 내부의 함수. this.view.lines배열을 넘겨주고 전달받은 배열내에 Line이 어느위치에 있나를 확인한다. 그리고 거기까지의 배열을 반환.
            return takeWhile(this.view.lines, (other: Line.ValueObject) => other !== this)
            //배열내에 모든값 합산.
                    .reduce((currentValue, line) => currentValue + line.height + this.view.contentFont.fontSize * (this.config.lineHeight - 1), 0)
                + this.topContext.layer * this.view.topContextLayerHeight;
        }

        //공백을 체크해본다.
        get isBlank(): boolean {
            //content는 전체문장을 의미한다.
            return this.view.store.content.slice(this.startIndex, this.endIndex - 1) === "";
        }
        /*
        get 함수명: boolean{
            return A===B;
        }
        이면 A===B일때 true 아니면 false를 반환한다.
        */

        get content(): string {
            if (this.endWithHardLineBreak) {
                if (this.isBlank) {
                    return "⮐";
                }
                return this.view.store.content.slice(this.startIndex, this.endIndex - 1);
            } else {
                return this.view.store.content.slice(this.startIndex, this.endIndex);
            }
        }

        get endWithHardLineBreak(): boolean {
            return this.view.store.content[this.endIndex - 1] === '\n';
        }

        update() {
            // safari doesn't support `white-space: pre;` very well
            // 빈칸에 대해서 nbsp로 replace!
            // and replace it back when export to .svg file
            // (and safari is very slow rendering large amount of svg)
            // bad for safari!
            this.svgElement.innerHTML = this.content.replace(/ /g, "&nbsp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            if (this.isBlank) { //비어있다면
                this.svgElement.style.fontSize = `${this.view.contentFont.fontSize / 4}px`;
            }
            //tspan의 위치를 재정의. x,y값.
            this.svgElement.setAttribute("x", this.view.paddingLeft.toString());
            this.svgElement.setAttribute("dy", this.dy.toString() + 'px');
        }

        //tspan(문장 한줄)을 생성하는 부분
        render(): SVGTSpanElement {
            this.svgElement = document.createElementNS(SVGNS, 'tspan') as SVGTSpanElement;
            const [topContextElement, backgroundElement] = this.topContext.render();
            //insertBefore로 인해 최상위 svg안에 textElement 앞에 g태그를 놓는다.
            this.view.svgElement.insertBefore(topContextElement, this.view.textElement);
            //this.view.markerElement.insertAdjacentElement('afterend', backgroundElement);
            //객체복사를 해준다. 즉, 하나의 라인을 tspan에 넣는다고 생각하면 된다.
            Object.assign(this.svgElement, {annotatorElement: this});
            this.update();
            return this.svgElement;
        }

        remove() {
            //g그룹과 tspan을 지운다.
            this.topContext.remove();
            this.svgElement.remove();
        }

        //Line전용 insertBefore함수를 만들어준다.
        insertBefore(other: Option<Line.ValueObject>) {
            //tspan을 생성하고
            this.render();
            //it이 가리키는건 line 그자체라는점.
            other.map(it => {
                //null과 undefine을 배제하고 생각하겠다는 의미.
                //상위노드인 text(parentNode)안에있는 other로 받은 tspan태그 앞에 this가 가리키는 tspan 태그를 두겠다는 의미.
                //아래과정도 유사하게 진행하는 과정. 그룹순서를 정리.
                it.svgElement.parentNode!.insertBefore(this.svgElement, it.svgElement);
                it.topContext.svgElement.parentNode!.insertBefore(this.topContext.svgElement, it.topContext.svgElement);
                it.topContext.backgroundElement.parentNode!.insertBefore(this.topContext.backgroundElement, it.topContext.backgroundElement);
            });
        }

        insertAfter(other: Option<Line.ValueObject>) {
            this.render();
            other.map(it => {
                //TargetNode.insertAdjacentElement("afterend",NextNode);의 의미는 TargetNode바로뒤에 NextNode를 넣는다는 의미이다.
                it.svgElement.insertAdjacentElement("afterend", this.svgElement);
                it.topContext.svgElement.insertAdjacentElement("afterend", this.topContext.svgElement);
                it.topContext.backgroundElement.insertAdjacentElement("afterend", this.topContext.backgroundElement);
            });
        }

        insertInto(parent: SVGTextElement) {
            //tspan을 생성한후 text태그 안에 tspan을 넣겠다는 의미이다.
            this.render();
            //tspan을 parent에 넣는다.
            parent.appendChild(this.svgElement);
        }
    }

    interface Token {
        readonly startIndex: number;
        readonly endIndex: number;
    }

    /**
     * warning: this class is tricky! 이 클래스는 다소 까다롭다고 한다.
     * do NOT touch unless you're sure!
     * todo: more test!
     */
    //라인을 분리시키는 역할을 하는 클래스
    class LineDivideService {
        // "word" is kept in one token
        //                                 English word                   number
        //                          vvvvvvvvvvvvvvvvvvvvvvvvvvvv   vvvvvvvvvvvvvvvvvvvv
        static readonly wordReg = /([a-zA-z][a-zA-Z0-9'’]*[-|.]?)|([+\-]?[0-9.][0-9.%]*)/g;
        //result의 경우 라인들의 배열(tspan 배열)
        private result: Array<Line.ValueObject> = [];
        //해당 배열은 startIndex,endIndex로 구성된 배열이다.
        private tokenQueue: Array<Token> = [];

        constructor(private view: View) {
        }

        get store() {
            return this.view.store;
        }

        //분리시키는 함수.
        //유념할 점은 여기서 합쳐지는게 아니다. 어딘가 다른부분에서 라인이 합쳐지는 문제가 있다.
        public divide(startIndex: number, endIndex: number): Array<Line.ValueObject> {
            //init을 통해 result와 tokenQueue배열을 선언해준다.
            this.init();
            let currentTokenStart = startIndex; //현재 토큰의 시작
            let currentTokenEnd = startIndex + 1; //현재 토큰의 끝
            do {
                let tokenEndAfterLabelMerged = this.mergeLabel(currentTokenEnd);
                let tokenEndAfterWordsMerged = this.mergeWord(tokenEndAfterLabelMerged);
                const noMergePerformed = tokenEndAfterLabelMerged === currentTokenEnd && tokenEndAfterLabelMerged === tokenEndAfterWordsMerged;
                //이소스가 줄넘김을 파악하는 소스로 추측
                if (this.store.content[currentTokenEnd - 1] === '\n') {
                    //다음줄로 넘어가는 부분이라면?
                    if (this.tokenQueue.length === 0) {
                        this.reduce(currentTokenEnd - 1, currentTokenEnd);
                    } else {
                        this.reduce(this.tokenQueue[0].startIndex, currentTokenEnd);
                    }
                    currentTokenStart = currentTokenEnd;
                } else {
                    this.shiftWithAutoReduce({startIndex: currentTokenStart, endIndex: currentTokenEnd});
                    currentTokenStart = currentTokenEnd;
                }
                ++currentTokenEnd;
            } while (currentTokenStart < endIndex);
            if (this.tokenQueue.length !== 0)
                this.reduce(this.tokenQueue[0].startIndex, this.tokenQueue[this.tokenQueue.length - 1].endIndex);
            let last: Option<Line.ValueObject> = none;
            for (let line of this.result) {
                last.map(it => it.next = some(line));
                line.last = last;
                last = some(line);
            }
            //최종적으로 result를 전달한다. 라인들!!
            return this.result;
        }


        private init() {
            this.result = [];
            this.tokenQueue = [];
        }

        // while currentToken ends in a label
        // merge the label into the token
        //          0123456789
        // token    [ ])
        // label      [   ])
        // out      [     ])
        private mergeLabel(currentTokenEnd: number): number {
            //getEntitiesCross는 라벨저장소 내에 currentTokenEnd - 1과 일치하는 값을 리턴한다.
            if (this.store.labelRepo.getEntitiesCross(currentTokenEnd - 1)
                //it이 가리키는건 label
                //some() 메서드는 형식화 배열 내 일부 요소가 제공되는 함수에 의해 구현되는 테스트를 통과하는지 여부를 테스트합니다. 즉 true or false를 반환.
                //endIndex가 currentTokenEnd의 요소를 넘어버린다면, 즉, 끝라인을 넘겨버렸다면
                .some(it => it.endIndex > currentTokenEnd)) 
                {
                //filter는 콜백함수로 지정된 조건에 맞는 요소를 다시 반환한다.
                return this.store.labelRepo.getEntitiesCross(currentTokenEnd - 1)
                    //라벨의 요소들중 currentTokenEnd보다 큰값을 가지고 오겠다.
                    .filter(it => it.endIndex > currentTokenEnd)
                    //정렬. 그중 첫번째 요소를 가지고 오겠다는 의미.(0)
                    .sort((a, b) => b.endIndex - a.endIndex)[0]
                    .endIndex;
                    //즉 최종적으로는 끝투머리에 있는 값을 반환하는셈.
            }
            return currentTokenEnd;
        };

        // while currentToken ends in a word
        // merge the word into the token
        //          0123456789
        // token    [ ])
        // word       [])
        // out      [  ])
        private mergeWord(currentTokenEnd: number): number {
            // part of a word is still a word
            LineDivideService.wordReg.lastIndex = 0;
            const nextWordRegTestResult = LineDivideService.wordReg.exec(this.store.contentSlice(currentTokenEnd - 1, currentTokenEnd + 1));
            if (nextWordRegTestResult === null) {
                return currentTokenEnd;
            }
            if (nextWordRegTestResult[0].length === 2) {
                return currentTokenEnd + 1;
            }
            return currentTokenEnd;
        };

        private reduce(startIndex: number, endIndex: number) {
            const newEntity = new Line.ValueObject(startIndex, endIndex, none, none, this.view);
            this.result.push(newEntity);
            this.tokenQueue = [];
        }

        private shiftWithAutoReduce(token: Token) {
            const currentQueueWidth = this.tokenQueue.length === 0 ? 0 : this.view.contentWidth(this.tokenQueue[0].startIndex, this.tokenQueue[this.tokenQueue.length - 1].endIndex);
            const currentTokenWidth = this.view.contentWidth(token.startIndex, token.endIndex);
            if (this.tokenQueue.length !== 0 && currentQueueWidth + currentTokenWidth > this.view.lineMaxWidth) {
                this.reduce(this.tokenQueue[0].startIndex, this.tokenQueue[this.tokenQueue.length - 1].endIndex + 1);
            }
            else {
                this.tokenQueue.push(token);
            }
        }
    }

    export namespace Service {
        export function divide(view: View, startIndex: number, endIndex: number) {
            return (new LineDivideService(view)).divide(startIndex, endIndex);
        }
    }
}
