<template app="app">
    <v-container>
        <v-row no-gutters="no-gutters">
            <div class="container" id="container-first" ref="container"></div>
            <v-dialog
                max-width="290"
                persistent="persistent"
                v-model="showLabelCategoriesDialog">
                <v-card>
                    <v-card-title>
                        <span class="headline">라벨링</span>
                    </v-card-title>
                    <v-card-text>
                        <v-radio-group v-model="selectedLabelCategory">
                            <v-radio
                                :key="category.id"
                                :label="category.text"
                                :value="category.id"
                                v-for="category in this.labelCategories"
                                @change="clickLabelCategories = true"></v-radio>
                        </v-radio-group>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click="addLabel" color="#4B89DC">
                            설정
                        </v-btn>
                        <v-btn @click="showLabelCategoriesDialog = false" color="#4B89DC">
                            취소
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
        <v-row align="end">
            <v-btn @click="download" color="#4B89DC">
                <v-icon left="left">mdi-cloud-download</v-icon>
                {{ $t("download") + "JSON" }}
            </v-btn>
            <v-btn @click="upload" color="#4B89DC">
                <input @change="upload" class="upload" type="file">
                    <v-icon left="left">mdi-cloud-upload</v-icon>
                    {{ $t("upload") }}
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

        enum CategorySelectMode {
            Create,
            Update
        }

        export default Vue.extend({
            components: {},
            data() {
                return {
                    jsonData: null,
                    annotator: null as Annotator | null,
                    selectedLabelCategory: null as LabelCategory.Entity | null,
                    clickLabelCategories: false as boolean,
                    showLabelCategoriesDialog: false as boolean,
                    json: "",
                    startIndex: -1,
                    endIndex: -1,
                    first: -1,
                    second: -1,
                    categorySelectMode: CategorySelectMode.Create,
                    selectedId: -1
                };
            },
            methods: {
                upload(e) {document
                    let reader = new FileReader();
                    reader.readAsText(e.target.files[0]);
                    reader.onload = (event) => {
                        window.setTimeout(() => {
                            this.jsonData = JSON.parse(event.target.result.toString())
                            if (this.annotator !== null) {
                                this
                                    .annotator
                                    .remove();
                            }
                            if (this.jsonData !== null && this.jsonData.content) {
                                this.annotator = this.createAnnotator();
                                this.updateJSON();
                            }
                            this
                                .$eventbus
                                .$emit("fileUploaded", JSON.parse(event.target.result.toString()));
                            this.$forceUpdate();
                        }, 10);
                    };
                    this
                        .$router
                        .push("annotate")
                        .catch(_ => {});
                },
                updateJSON(): void {
                    this.json = this.highlight(JSON.stringify(this.annotator.store.json, null, 4));
                },
                addLabel(): void {
                    if (this.categorySelectMode === CategorySelectMode.Update && this.clickLabelCategories) {
                        this
                            .annotator
                            .applyAction(Action.Label.Update(this.selectedId, this.selectedLabelCategory));
                    } else if(this.clickLabelCategories){
                        this
                            .annotator
                            .applyAction(
                                Action.Label.Create(this.selectedLabelCategory, this.startIndex, this.endIndex)
                            );
                    }
                    this.showLabelCategoriesDialog = false;
                    this.clickLabelCategories  = false;
                    this.updateJSON();
                },


                createAnnotator(): Annotator {
                    const annotator = new Annotator(this.jsonData, this.$refs.container);
                    annotator.on("textSelected", (startIndex, endIndex) => {
                        this.startIndex = startIndex;
                        this.endIndex = endIndex;
                        this.categorySelectMode = CategorySelectMode.Create;
                        this.showLabelCategoriesDialog = true;
                    });

                    annotator.on("buttonClicked", (labelId, event : MouseEvent) => {
                        if (event.ctrlKey) {
                            this.categorySelectMode = CategorySelectMode.Update;
                            this.selectedId = labelId;
                            this.showLabelCategoriesDialog = true;
                        } else {
                            annotator.applyAction(Action.Label.Delete(labelId));
                        }
                        this.updateJSON();
                    });

                    annotator.on("contentInput", (position, value) => {
                        annotator.applyAction(Action.Content.Splice(position, 0, value));
                        this.updateJSON();
                    });
                    annotator.on("contentDelete", (position, length) => {
                        annotator.applyAction(Action.Content.Splice(position, length, ""));
                        this.updateJSON();
                    });
                    return annotator;
                },
                highlight(code : string): string {
                    return Prism.highlight(code, Prism.languages.javascript, "javascript");
                },
                download: function () {
                    const eleLink = document.createElement("a");
                    eleLink.download = "data.json";
                    eleLink.style.display = "none";
                    const blob = new Blob([JSON.stringify(this.annotator.store.json, null, 4)]);
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
                this.jsonData = defaultData;
                if (this.annotator !== null) {
                    this
                        .annotator
                        .remove();
                }
                if (this.jsonData !== null && this.jsonData.content) {
                    this.annotator = this.createAnnotator();
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
                if (this.jsonData !== null && this.jsonData.content) {
                    this.annotator = this.createAnnotator();
                    this.updateJSON();
                }
            }
        });
    </script>
    <style scoped="scoped">

        .container-wrapper {
            border-right: solid 2px black;
        }
    </style>
    <style>
        .container > svg {
            font-family: Verdana, serif;
            display: scroll;
        }

        svg {
            display: block;
            pointer-events: none;
            overflow: scroll;
            width: 100%;
            height: 100%;
            background-clip: padding-box;
        }

        g {
            pointer-events: all !important;
        }

        tspan {
            pointer-events: auto;
        }

        .poplar-annotation-label {
            font-size: 14px;
            font-family: Verdana, serif;
        }
        #container-first{
            overflow: scroll;
        }

        div.container {
            position: relative;
            /*display: flex;*/
            width: 100%;
            height: 100%;
        }

        .poplar-annotation-connection {
            font-family: Verdana, serif;
            font-size: 12px;
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