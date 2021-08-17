<template>
    <div>
      <div class = "Info Personal_Identification">
        <br>
        <p v-for="users in hireInfoJson.users" :key="users.id + 'r'">
          {{ users.name }} {{ users.gender }} 만 {{users.age}}세 ({{ users.id }})
        </p>
        <br>
        <br>
        <br>
        <div class = "Info" id = "TelAndAdd">     
          <p id = "TelAndAdd" v-for="users in hireInfoJson.users" :key="users.id +'l'">
            T. {{ phoneFomatter(users.phoneNumber)}}
          </p>
          <p id = "TelAndAdd" v-for="users in hireInfoJson.users" :key="users.id">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; M. {{users.Email_Address}}
          </p>
        </div>
      </div>
      <div class = "Info" id = "WantPlace">
        <p v-for="users in hireInfoJson.users" :key="users.id + 'q'">
          지원직무 1순위: {{users.first_place}}
        </p>
        <p v-for="users in hireInfoJson.users" :key="users.id + 'w'">
          지원직무 2순위: {{users.second_place}}
        </p>
      </div>
    </div>
</template>
<script>
import hireInfoJsonData from '../assets/hireInfo.json'
export default {
  data() {
    return {
      hireInfoJson: hireInfoJsonData
    };
  },
  mounted: function () {
    this.handleInfoResize();
    window.addEventListener('resize', this.handleInfoResize);
  },
  methods:{
    handleInfoResize(){
      this.windowWidth = window.innerWidth;
      if(this.windowWidth < 956){
        document.getElementById("WantPlace").style.marginLeft = "10%"
        document.getElementById("Introduce-Part").style.fontSize = "10px"
        document.getElementById("Introduce-Part").style.marginTop = "10px"
      }
      else{
        document.getElementById("WantPlace").style.marginLeft = "20%"
        document.getElementById("Introduce-Part").style.fontSize = "14px"
      }
    },
    phoneFomatter(num, type){
      var formatNum = '';
      if(num.length === 11){
          if(type == 0){
              formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3');
          }else{
              formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
          }
      }
      else if(num.length === 8){
          formatNum = num.replace(/(\d{4})(\d{4})/, '$1-$2');
      }
      return formatNum;
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.handleResize);
    }
  }
}
</script>
<style>
.Info{
  float: left;
  font-weight: 700;
  vertical-align: middle;
}
.Personal_Identification{
  margin-left: 2%;
}
#WantPlace{
  margin-top: 43px;
  margin-left: 20%;
}
#TelAndAdd{
  float: left;
}
</style>