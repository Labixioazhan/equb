/*
 * @Description: 
 * @Author: xuzhan
 * @Date: 2021-12-03 13:59:44
 * @LastEditTime: 2021-12-03 14:02:33
 * @LastEditors: xuzhan
 */
import Vue from 'vue'
//引入外部js
import  Hammer from './hammer.min.js'


function vueTouch(el,type,binding){
    this.el = el;
    this.type = type;
    this.binding = binding;
    //直接调用
    var hammertime = new Hammer(this.el);
    hammertime.on(this.type,this.binding.value);
}

//包装成指令
const tap = Vue.directive("tap",{
    bind:function(el,binding){
        new vueTouch(el,"tap",binding);
    }
});

const swipeleft = Vue.directive("swipeleft",{
    bind:function(el,binding){
        new vueTouch(el,"swipeleft",binding);
    }
});

const swiperight = Vue.directive("swiperight",{
    bind:function(el,binding){
        new vueTouch(el,"swiperight",binding);
    }
});

const press = Vue.directive("press",{
    bind:function(el,binding){
        new vueTouch(el,"press",binding);
    }
});

//导出需要的指令
export{tap,swipeleft,swiperight,press}