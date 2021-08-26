<!--5page 2번 자기소개서 요약-->
<template>
    <v-container>
        <v-row no-gutters="no-gutters">
            <!--5page 2-1번 질문 키워드 버튼-->
            <div id="Introduction_Btn"></div>
            <!--7page 2번 셀렉트 박스: 타인 평가-->
            <v-select
                :items="selectItems"
                label="평가자"
                dense="dense"
                item-text="text"
                item-value="id"
                v-model="value"
                v-on:change="makeSelectBoxOptions()"></v-select>
            <!--5page 2-5번 가이드 텍스트-->
            <v-alert outlined="outlined" color="purple" style="width: 92%">
                <div style="text-align: center">#마음에 드는 문장을 드래그 해주세요!</div>
            </v-alert>
            <!--5page 2-3번 원문-->
            <div class="container_of_LabelProject" id="container-first" ref="container"></div>
        </v-row>
        <v-row align="end">
            <!--5page 2-6번 저장 버튼-->
            <v-btn @click="download" color="#4B89DC">
                <v-icon left="left">mdi-cloud-download</v-icon>
                {{ $t("download") + "JSON" }}
            </v-btn>
        </v-row>
    </v-container>
</template>
<script lang="ts">
        import Vue from "vue";
        import Prism from "prismjs";
        import {Annotator, Action} from "../index";
        import {LabelCategory} from "../Store/LabelCategory";
        import defaultData from "../assets/default.json";
        import questionJson from "../assets/question.json";

        enum CategorySelectMode {
            Create,
            Update
        }
        export default Vue.extend({
            components: {},
            data() {
                return{
                    value: null,
                    selectItems: defaultData.labelCategories,
                    testJsonData: null,
                    jsonData: null,
                    json: "",
                    annotator: null as Annotator | null,
                    selectedLabelCategory: null as LabelCategory.Entity | null,
                    clickLabelCategories: true as boolean,
                    showLabelCategoriesDialog: false as boolean,
                    //selectBoxMode는 selectBox에서 특정인물을 골랐는지 안골랐는지를 확인하고자 할때 사용하는 변수.
                    selectBoxMode: false as boolean,
                    currentState: 0,
                    startIndex: -1,
                    endIndex: -1,
                    first: -1,
                    second: -1,
                    categorySelectMode: CategorySelectMode.Create,
                    selectedId: -1
                };
            },
            methods: {
                //ID가 순서대로 정렬이 안된상태에서 selectBox내에 option을 고르고 라벨링을 삭제하게 되면, Annotator가 겹쳐서 적용되는 버그가 있음.
                //해당 버그를 방지하고자 LabelID를 오름차순으로 정리해주는 함수임.
                sortLabelID(){
                    let newID;
                    for(let Introduction of defaultData.introductions){
                        newID = 0;
                        for(let Label of Introduction.labels){
                            Label.id = newID;
                            newID++;
                        }
                    }
                },
                //5page 2-1번 질문 키워드 버튼들을 생성시켜준다.
                //다른 자기소개서 조회를 돕는 버튼을 형성하는 함수.
                makeContentSelectBtns(){
                    let _this = this;
                    for(const QJsonData of questionJson.questionData){
                        let Question_Btn = document.createElement("button");
                        Question_Btn.textContent = QJsonData.question;
                        Question_Btn.addEventListener("click", function(){
                            _this.currentState = QJsonData.id;
                            _this.selectBoxMode = false;
                            _this.annotator.remove();
                            _this.annotator = _this.updateAnnotator(2 ,QJsonData.id);
                            _this.updateJSON();
                        });
                        document.getElementById("Introduction_Btn").appendChild(Question_Btn);
                    }
                },

                //7page 2번 셀렉트 박스: 타인 평가부분에서 
                //생성된 SelectBox내에 Option을 고르게 되면 Option이 가지고 있는 id값을 가지고와서 updateAnnotator에 전달해주는 함수.
                makeSelectBoxOptions(){
                    var _this = this;
                    _this.annotator.remove();
                    _this.annotator = _this.updateAnnotator(3, parseInt(this.value)); //update Annotator SelectBox Option click Mode use.
                },

                //selectBox에서 Option을 고른 상황에서 라벨을 추가하는 상황이 있을경우에 동작하는 함수.
                pushLabel_When_SelectBoxMode(SelectBox_Option_Introduction: any, IntroPoint: number): void {
                    for (let SelectBox_Labels of SelectBox_Option_Introduction.labels) {
                        let alreadyExistLabels = false; //defaultData내에 이미 존재하는 라벨인지를 확인하기 위한 Boolean변수.
                        for(let JsonDataLabels of defaultData.introductions[IntroPoint].labels){
                            if(JsonDataLabels.id === SelectBox_Labels.id && JsonDataLabels.startIndex === SelectBox_Labels.startIndex 
                            && JsonDataLabels.endIndex === SelectBox_Labels.endIndex){
                                alreadyExistLabels = true;
                            }
                        }
                        if(alreadyExistLabels === false){
                            defaultData.introductions[IntroPoint].labels.push(SelectBox_Labels);
                        }
                    }
                },

                //Json의 상태를 업데이트 해주는 함수이다.
                updateJSON(): void {
                    for (var i = 0; i <= defaultData.introductions.length; ++i) {
                        if(defaultData.introductions[i].id === this.annotator.store.json.id){
                            if(this.selectBoxMode){
                                this.pushLabel_When_SelectBoxMode(this.annotator.store.json, i);
                                break;
                            }
                            else{
                                defaultData.introductions[i] = this.annotator.store.json;
                                break;
                            }
                        }
                    }
                    JSON.stringify(defaultData, null);
                    this.json = this.highlight(JSON.stringify(defaultData, null, 4));
                },

                //selectBoxMode일때도 정상적으로 삭제가 적용되도록 하기 위해서 해당 함수를 따로 만들게 되었음.
                //그냥 updateJSON()을 하게 되면 현재 selectBox에서 고르게된 Option으로 나오게된 Annotator가 전체보기에 그대로 적용되기 때문에 
                //이런함수를 만들었다.
                updateJSON_When_LabelDelete(deleteLabelID: number): void{
                    for (let i = 0; i <= defaultData.introductions.length; ++i) {
                        if(defaultData.introductions[i].id === this.annotator.store.json.id){ 
                            defaultData.introductions[i].labels = defaultData.introductions[i].labels.filter(it => it.id !== deleteLabelID);
                            break;
                        }
                    }
                    JSON.stringify(defaultData, null);
                    this.json = this.highlight(JSON.stringify(defaultData, null, 4));
                },

                updateAnnotator(Mode: number, point: number): Annotator { 
                    //Mode 변수는 값에 따라서 업데이트 방식을 바꿔준다.
                    //point 변수는 Mode가 2일때는 몇번째 자기소개서의 값인지를 나타내고 Mode가 3일때는 SelectBox의 몇번째 값인지에 대한 정보를 가진다.
                    //Mode = 0 : create Annotator
                    //Mode = 1 : normal update(평상시 상황에서 update를 할때.)
                    //Mode = 2 : Question Button Click. Show another Contents
                    //Mode = 3 : Select Box Option Click. Show labels for options 
                    let annotator: Annotator;
                    //create Annotator Mode
                    if(Mode === 0){
                        annotator = new Annotator(this.jsonData, this.$refs.container);
                        this.settingEvent(annotator, false);
                    }
                    //normal update Mode
                    else if(Mode === 1){
                        annotator = new Annotator(this.annotator.store.json, this.$refs.container);
                        this.settingEvent(annotator, false);
                    }
                    //Question Button Click Mode
                    else if(Mode === 2){
                        this.jsonData = defaultData.introductions[point];
                        this.jsonData.labelCategories = defaultData.labelCategories;
                        annotator = new Annotator(defaultData.introductions[point], this.$refs.container);
                        this.settingEvent(annotator, false);
                    }
                    //
                    else if(Mode === 3){
                        //SelectBox에서 고른 Option이 전체보기일 경우
                        if(point === -1){
                            this.selectBoxMode = false;
                            annotator = new Annotator(defaultData.introductions[this.currentState], this.$refs.container);
                            this.settingEvent(annotator, false);
                        }
                        //SelectBox에서 고른 Option이 특정인물일 경우
                        else{
                            this.selectBoxMode = true;
                            let FindLabels = defaultData.introductions[this.currentState].labels.filter(element => element.categoryId !== point);
                            annotator = new Annotator(defaultData.introductions[this.currentState], this.$refs.container);
                            for(let deleteAction of FindLabels){
                                annotator.applyAction(Action.Label.Delete(deleteAction.id));
                            }
                            this.settingEvent(annotator, true);
                        }
                    }
                    return annotator;
                },

                highlight(code : string): string {
                    return Prism.highlight(code, Prism.languages.javascript, "javascript");
                },

                //Annotator를 업데이트하거나 새로 등록할때 이벤트를 생성해주는 함수.
                settingEvent(annotator: Annotator, selectBoxModeCheck: Boolean): void{
                    //텍스트를 드레그했을 경우.
                    annotator.on("textSelected", (startIndex, endIndex) => {
                        this.startIndex = startIndex;
                        this.endIndex = endIndex;
                        this.categorySelectMode = CategorySelectMode.Create;
                        this.addLabel();
                    });

                    //삭제버튼을 눌렀을 경우
                    annotator.on("buttonClicked", (labelId, event : MouseEvent) => {
                        if (event.ctrlKey) {
                            this.categorySelectMode = CategorySelectMode.Update;
                            this.selectedId = labelId;
                            this.addLabel();
                        } else {
                            annotator.applyAction(Action.Label.Delete(labelId));
                        }
                        if(!selectBoxModeCheck){
                            this.updateJSON();
                        } else{
                            //selectBoxMode일때만 특별하게 적용되는 삭제함수 진행.
                            //selectBoxMode일때도 정상적으로 삭제가 적용되도록 하기 위해서 해당 함수를 따로 만들게 되었음.
                            //그냥 updateJSON()을 하게 되면 현재 selectBox에서 고르게된 Option으로 나오게된 Annotator가 전체보기에 그대로 적용되기 때문에 
                            //이런함수를 만들었다.
                            this.updateJSON_When_LabelDelete(labelId);
                        }
                    });

                    annotator.on("contentInput", (position, value) => {
                        annotator.applyAction(Action.Content.Splice(position, 0, value));
                    });

                    annotator.on("contentDelete", (position, length) => {
                        annotator.applyAction(Action.Content.Splice(position, length, ""));
                    });
                },

                //라벨을 추가할때 동작하는 함수.
                addLabel(): void {
                    if (this.categorySelectMode === CategorySelectMode.Update && this.clickLabelCategories) {
                        this
                            .annotator
                            .applyAction(Action.Label.Update(this.selectedId, defaultData.userInformation[0].id)); 
                            //웹사이트를 이용하는 유저의 id값을 가지고와서 거기에 해당하는
                            //LabelCategories의 element값으로 라벨링을 한다.
                            this.updateJSON();
                    } else if(this.clickLabelCategories){
                        this.annotator
                        .applyAction(
                            Action.Label.Create(defaultData.userInformation[0].id, this.startIndex, this.endIndex)
                        );
                        this.updateJSON();
                    }
                    this.showLabelCategoriesDialog = false;
                    this.clickLabelCategories = true;
                },

                //제이슨 데이터를 다운로드 하는 함수.
                download: function () {
                    const eleLink = document.createElement("a");
                    eleLink.download = "data.json";
                    eleLink.style.display = "none";
                    const blob = new Blob([JSON.stringify(defaultData, null, 4)]);
                    eleLink.href = URL.createObjectURL(blob);
                    document
                        .body
                        .appendChild(eleLink);
                    eleLink.click();
                    document
                        .body
                        .removeChild(eleLink);
                }
            },
            computed: {
                labelCategories(): LabelCategory.Entity[]{
                    if (this.annotator === null) {
                        return [];
                    }
                    const result = [];
                    for (const [_, category] of this.annotator.store.labelCategoryRepo) {
                        result.push(category);
                    }
                    return result;
                }
            },
            created(): void {
                this.jsonData = defaultData.introductions[0];
                //카테고리 값을 가지고온다.
                this.jsonData.labelCategories = defaultData.labelCategories;
                if (this.annotator !== null) {
                    this
                        .annotator
                        .remove();
                }
                if (this.jsonData !== null && this.jsonData.content) {
                    this.annotator = this.updateAnnotator(0, 0);
                    this.updateJSON();
                }
                this
                    .$eventbus
                    .$on("downloadRequest", () => {
                        this.download();
                    });
                this
                    .$router
                    .push("annotate")
                    .catch(_ => {});
            },
            mounted(): void {
                this.sortLabelID();
                this.makeContentSelectBtns();
                let _this = this;
                //최초로 Annotator를 그려주는 부분.
                if (this.jsonData !== null && this.jsonData.content) {
                    this.annotator = this.updateAnnotator(0, 0);
                    this.updateJSON();
                }
                //resize 이벤트를 등록해주는 소스.
                window.addEventListener("resize", function(){    
                    _this.annotator.remove();
                    _this.annotator = _this.updateAnnotator(1, 0);
                    _this.updateJSON();
                });
                //load 이벤트를 등록한 이유는 fontFamily를 app에서 지정해줄때 Annotator에서 font의 변화가 생기지만 그 변화로 인해 만약 라벨링을 하면 기존의 font크기에 맞춰서
                //라벨링이 그려지는 현상이 있기때문에 이를 방지하고자 다시한번더 Annotator를 그려주는 소스이다.
                window.addEventListener("load", function(){
                    _this.annotator.remove();
                    _this.annotator = _this.updateAnnotator(1, 0);
                    _this.updateJSON();
                });
            }
        });
</script>
<style scoped="scoped">
    .container-wrapper {
        border-right: solid 2px black;
    }
</style>
<style>
    .no-gutters{
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    #Select_Box{
        height: 50%;
        border: 1px solid black;
        border-radius:3px;
        margin-bottom: 2%;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance : none;
    }

    #Introduction_Btn > button{
        background-color: #1976d2;
        text-align: center;
        width: 35%;
        height: 50px;
        float: left;
        margin-left: 8%;
        margin-bottom: 2%;
        font-size: 13px;
        font-weight: 700;
        /*background-color: #d5d5f1;*/
        border-radius: 10px;
    }
    
    .container_of_LabelProject {
        position: relative;
        overflow-y: scroll;
        overflow-x: hidden;
        /*display: flex;*/
        width: 100%;
        height: 400px;
    }

    .container_of_LabelProject > svg {
        display: block;
        pointer-events: none;
        width: 100%;
        height: 100%;
        /*background-clip: padding-box;*/
    }

    .container_of_LabelProject > g {
        pointer-events: all !important;
    }

    tspan {
        pointer-events: auto;
    }

    path {
        cursor: pointer !important;
        pointer-events: all;
    }
    .upload {
        position: absolute;
        width: 85px;
        height: 37px;
        opacity: 0;
        cursor: pointer;
    }
</style>
