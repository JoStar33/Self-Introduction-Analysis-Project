<template app="app">
    <v-app>
        <v-app-bar height="110" app="app">
            <v-img
                src="./Image/ISU_Logo.png"
                max-width="90"
                max-height="90"
                style="float: left"></v-img>
            <h2>
                &nbsp;&nbsp;이수 시스템
            </h2>
        </v-app-bar>
        <v-content fluid="fluid">
            <v-card class="top-Part">
                <v-img
                    src="./Image/profile.jpg"
                    max-width="150"
                    max-height="150"
                    style="float: left"></v-img>
                <InfoApplicant id="Introduce-Part"></InfoApplicant>
            </v-card>
            <v-col>
                <v-card class="left-Part">
                    <v-alert
                        class="Title"
                        color="primary"
                        dark="dark"
                        icon="mdi-vuetify"
                        border="left">
                        경력 생애 주기
                    </v-alert>
                    <div id="TimelineBox">
                        <TimeLine></TimeLine>
                    </div>
                </v-card>
                <div class="right-Part">
                    <v-card>
                        <v-alert
                            class="Title"
                            color="primary"
                            dark="dark"
                            icon="mdi-vuetify"
                            border="left">
                            자기소개서 키워드
                        </v-alert>
                        <KeywordsApplication></KeywordsApplication>
                    </v-card>
                    <v-card>
                        <v-alert
                            class="Title"
                            color="primary"
                            dark="dark"
                            icon="mdi-vuetify"
                            border="left">
                            지원자 자기소개서
                        </v-alert>
                        <Annotate class="LabelProject"></Annotate>
                    </v-card>
                </div>
            </v-col>
        </v-content>
        <v-footer dark="dark" padless="padless">
            <v-card
                flat="flat"
                tile="tile"
                class="indigo lighten-1 white--text text-center"
                width="100%">
                <v-card-text>
                    <v-btn v-for="icon in icons" :key="icon" class="mx-4 white--text" icon="icon">
                        <v-icon size="24px">
                            {{ icon }}
                        </v-icon>
                    </v-btn>
                </v-card-text>
                <v-card-text class="white--text pt-0">
                    <br>
                    TEL : 02)590-6799 06575
                    <br>
                    서울특별시 서초구 사평대로 84 (반포동)
                    <br>
                    COPYRIGHT ISU SYSTEM. ALL RIGHTS RESERVED.
                </v-card-text>
                <v-divider></v-divider>
                <v-card-text class="white--text">
                    {{ new Date().getFullYear() }}
                    —
                    <strong>ISU SYSTEM</strong>
                </v-card-text>
            </v-card>
        </v-footer>
    </v-app>
</template>
<script lang="ts">
        import Vue from "vue";
        import Annotate from "@/views/Annotate.vue";
        import TimeLine from "@/views/TimeLine.vue";
        import InfoApplicant from "@/views/PersonalInfo.vue";
        import KeywordsApplication from "@/views/KeywordsApplication.vue";

        export default Vue.extend({
             data: () => ({
                icons: [
                'mdi-facebook',
                'mdi-twitter',
                'mdi-linkedin',
                'mdi-instagram',
                ],
            }),
            components: {
                TimeLine,
                Annotate,
                InfoApplicant,
                KeywordsApplication
            },
            mounted() {
                this.handleResize();
                window.addEventListener('resize', this.handleResize);
            },
            methods: {
                handleResize() {
                    this.windowWidth = window.innerWidth;
                    if(this.windowWidth < 850){
                        document.getElementById("Timeline").style.transform = "scale(0.35)";
                        document.getElementById("Timeline").style.transformOrigin = "3% center";
                        document.getElementById("TimelineBox").style.overflowX = "scroll";
                        document.getElementById("TimelineBox").style.height = "130px";
                        document.getElementById("TimelineBox").style.marginBottom = "2%";
                    }
                    else if(this.windowWidth < 950){
                        document.getElementById("Timeline").style.transform = "scale(0.40)";
                        document.getElementById("Timeline").style.transformOrigin = "5% center";
                        document.getElementById("TimelineBox").style.overflowX = "hidden";
                        document.getElementById("TimelineBox").style.height = "130px";
                        document.getElementById("TimelineBox").style.marginBottom = "2%";
                    }
                    else if(950 <= this.windowWidth && this.windowWidth <= 1263){
                        document.getElementById("Timeline").style.transform = "scale(0.45)";
                        document.getElementById("Timeline").style.transformOrigin = "5% center";
                        document.getElementById("TimelineBox").style.overflowX = "hidden";
                        document.getElementById("TimelineBox").style.height = "130px";
                        document.getElementById("TimelineBox").style.marginBottom = "2%";
                    }
                    else if(1263 < this.windowWidth && this.windowWidth < 1904){
                        document.getElementById("Timeline").style.transform = "scale(0.62)";
                        document.getElementById("Timeline").style.transformOrigin = "5% center";
                        document.getElementById("TimelineBox").style.overflowX = "hidden";
                        document.getElementById("TimelineBox").style.height = "130px";
                        document.getElementById("TimelineBox").style.marginBottom = "2%";
                    }
                    else{
                        document.getElementById("Timeline").style.transform = "scale(0.97)";
                        document.getElementById("Timeline").style.transformOrigin = "5% center";
                        document.getElementById("TimelineBox").style.overflowX = "hidden";
                        document.getElementById("TimelineBox").style.height = "200px";
                        document.getElementById("TimelineBox").style.marginBottom = "0%";
                        document.getElementById("TimelineBox").style.marginTop = "1%";
                    }
                },

                beforeDestroy() {
                    window.removeEventListener('resize', this.handleResize);
                }
            }
        });
    </script>

    <style>
        @import url(http://fonts.googleapis.com/earlyaccess/notosanskr.css); 
        div{
            font-family: 'Noto Sans KR', sans-serif;
        }
        .LabelProject {
            /*width: 48vw !important;*/
            width: 96%;
        }
        #devide-Part {
            border-style: dotted;
            border-color: black;
            border-radius: 10px;
            border: 0.5;
        }
        #Introduce-Part {
            display: left;
        }
        .top-Part {
            width: 100%;
            height: 150px;
            margin-bottom: 10px;
        }
        .left-Part {
            width: 49.8%;
            float: left;
            box-sizing: border-box;
        }
        .right-Part {
            width: 49.8%;
            float: right;
            box-sizing: border-box;
        }
        div#TimelineBox {
            width: 96%;
            float: left;
            height: 130px;
            overflow-x: hidden;
            overflow-y: hidden;
            margin-left: 2%;
            margin-bottom: 2%;
            margin-top: -2%;
        }
        .Title {
            height: 70%;
            text-align: left;
            font-size: 15px;
            font-weight: 700;
        }
        .Title > i {
            float: left !important;
        }
    </style>