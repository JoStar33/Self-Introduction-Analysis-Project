<!--요구사항 3page 4 내용-->
<template>
    <GChart
        id="Timeline"
        type="Timeline"
        :settings="{ packages: ['timeline'],
        language: 'ko' }"
        :data="timelineData"
        :options="timelineOptions"/>
</template>
<script>
//vue-google-charts를 불러와서 사용하기때문에 터미널에 "npm i vue-google-charts"를 입력해서 vue-google-charts를 다운해줘야함.
import { GChart } from "vue-google-charts";
import timelineJson from '../assets/timelineTest.json'

export default {
  name: "App",
  components: {
    GChart,
  },

  data() {
    return {
      startYear: null,
      startMonth: null,
      startDate: null,
      endYear: null,
      endMonth: null,
      endDate: null,
      timelineData: [  
        [
          { type: 'string', id: 'Term' },
          { type: 'string', id: 'Name' },
          { type: 'string', role: 'style' },
          { type: 'date', id: 'StartDate' },
          { type: 'date', id: 'EndDate' },
        ]
      ]
      ,
      timelineOptions: {
        timeline: {
          rowLabelStyle: { fontName: "Noto Sans KR"},
          colorByRowLabel: true,
          barLabelStyle: {
            fontSize: 10
          }
        },
        tooltip: {
          textStyle: 
          { 
            fontName: "Noto Sans KR", 
            fontSize: 14
          } 
        }
      },
    };
  },
  
  mounted: function () {
    //변수 선언부
    let title_Array = []; //몇번째 줄에 타이틀이 무엇인지를 정의(커리어 종류)
    let title_of_Color = [[255, 0, 0], [51, 102, 255], [253, 220, 0]]; //색의 rgb값 정보를 담는 배열.
    let title_Number_In_One_Line = []; //하나의 라인에 몇개의 라벨이 들어있는지를 판별.
    let title_Number_In_One_Line_Current = []; //현재 이라인에 라벨의 위치

    this.Init_Of_title_Number_In_One_Line(title_Number_In_One_Line, title_Number_In_One_Line_Current);
    this.titleArray_Pusher(title_Array, title_Number_In_One_Line);
    this.Input_Into_timelineData(title_Array, title_of_Color, title_Number_In_One_Line, title_Number_In_One_Line_Current);
  },

  methods: {
    //가로열 몇번째 값인지를 가지는 배열.
    Init_Of_title_Number_In_One_Line(title_Number_In_One_Line, title_Number_In_One_Line_Current){
      for(let i = 0; i < timelineJson.items.length; ++i){
        title_Number_In_One_Line[i] = 0;
        title_Number_In_One_Line_Current[i] = 0;
      }
    },

    //세로열에 고유값이 어떤게 있는지 계산하고 이를 배열의 형태로 가지는 함수.
    titleArray_Pusher(title_Array, title_Number_In_One_Line){
      for(const timeItems of timelineJson.items){
        let title = String(timeItems.title);
        if(!title_Array.includes(title)){
          title_Array.push(title);
        }
        ++title_Number_In_One_Line[title_Array.indexOf(title)];
      }
    },

    Input_Into_timelineData(titleArray, title_of_Color, title_Number_In_One_Line, title_Number_In_One_Line_Current){
      for(const timeItems of timelineJson.items){
        let timelineStart = parseInt(timeItems.startDate);
        let timelineEnd = parseInt(timeItems.endDate);
        [this.startYear, this.startMonth, this.startDate] = this.Make_YearMonthDate(timelineStart);
        [this.endYear, this.endMonth, this.endDate] = this.Make_YearMonthDate(timelineEnd);
        [this.minYear, this.maxYear] = this.setMaxMinYear(this.startYear, this.endYear, this.minYear, this.maxYear)
        let title = String(timeItems.title);
        ++title_Number_In_One_Line_Current[titleArray.indexOf(title)];

        //최종적으로는 timelineData에 계산해준 값들을 배열로 만들고 넣어준다.
        this.timelineData.push(
          [ timeItems.title
          , timeItems.labelname
          , this.RGB_Calculater(title_of_Color[titleArray.indexOf(title)], title_Number_In_One_Line[titleArray.indexOf(title)], title_Number_In_One_Line_Current[titleArray.indexOf(title)])
          , new Date(this.startYear, this.startMonth, this.startDate)
          , new Date(this.endYear, this.endMonth, this.endDate)]
        );
      }
      this.set_MinWidth_And_MaxWidth();
    },

    //최대 최저 길이를 지정해주는 함수. google charts 라이브러리를 사용하기 때문에 구글차트의 크기가 줄었을경우 연도들이 간소화돼서 보이는 현상을 막고자
    //해당함수를 만들게 되었음.
    set_MinWidth_And_MaxWidth(){
      document.getElementById("Timeline").style.minWidth = String(45 + 50 * (this.maxYear - (this.minYear - 1))) + "px";
      document.getElementById("Timeline").style.width = String(45 + 50 * (this.maxYear - (this.minYear - 1))) + "px";
      document.getElementById("Timeline").style.maxWidth = String(45 + 50 * (this.maxYear - (this.minYear - 1))) + "px";
      document.getElementById("Timeline").style.minHeight = "180px";
    },

    setMaxMinYear(startYear, endYear, minYear, maxYear){
        if(startYear < minYear){
          minYear = startYear;
        }
        if(endYear > maxYear){
          maxYear = endYear;
        }
        return [minYear, maxYear];
    },

    //RGB값에따라 시간이 지날수록 점점 타임라인바의 색이 연해지도록 하는 함수.
    RGB_Calculater([Red, Green, Blue], title_Number_In_One_Line, title_Number_In_One_Line_Current){
      if(Red === 255){
        Red = parseInt((2 * Red / 5) + ((3 * Red / 5) / title_Number_In_One_Line) * title_Number_In_One_Line_Current)
      }
      else if(Green >= 220){
        Green = parseInt((2 * Green / 3) + ((Green / 3) / title_Number_In_One_Line) * title_Number_In_One_Line_Current)
      }
      else if(Blue === 255){
        Blue = parseInt((2 * Blue / 5) + ((3 * Blue / 5) / title_Number_In_One_Line) * title_Number_In_One_Line_Current)
      }
      return "rgb("+ Red +","+ Green +","+ Blue +")";
    },

    //연도, 달, 날짜를 계산해주는 함수.
    Make_YearMonthDate(timelineNumber){
      let Year = parseInt(timelineNumber / 10000);
      let Month = parseInt((timelineNumber % 10000) / 100);
      let Date = parseInt((timelineNumber % 100));
      return [Year, Month, Date];
    }
  }
};

</script>
<style>
    @import url(//fonts.googleapis.com/earlyaccess/notosanskr.css);
    #Timeline {
      width: 100%;
      display: flex;
      font-weight: bold !important;
      font-family: "Noto Sans", sans-serif !important;
      transform: scale(0.65);
      transform-origin : 0% center;
    }
    #Timeline > div{
        height: 150px;
        overflow-y: visible;
    }
    #Timeline * rect{
      font-family: "Noto Sans", sans-serif !important;
      stroke-width: 1
      !important;
      stroke: black
      !important;
    }
</style>


