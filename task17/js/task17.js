/* 数据格式演示
var aqiSourceData = {
  "北京": {
    "2016-01-01": 10,
    "2016-01-02": 10,
    "2016-01-03": 10,
    "2016-01-04": 10
  }
};
*/

// 以下两个函数用于随机模拟生成测试数据
/*
 *标准化年月日格式：'xxxx-xx-xx'
 */
function getDateStr(dat) {
  var y = dat.getFullYear(); //获取年份
  var m = dat.getMonth() + 1; //获取月份（从0开始的）
  m = m < 10 ? '0' + m : m; //保证m是两位
  var d = dat.getDate(); //获取日期（天）
  d = d < 10 ? '0' + d : d; //保证d是两位
  return y + '-' + m + '-' + d; //'xxxx-xx-xx'
}
/*
 *产生随机数：产生数量为 2016年前三个月天数 的随机数组
 */
function randomBuildData(seed) {
  var returnData = {}; //对象
  var dat = new Date("2016-01-01");
  var datStr = ''
  for (var i = 1; i < 92; i++) { //1到3月份的天数
    datStr = getDateStr(dat); //标准化dat：'xxxx-xx-xx'
    returnData[datStr] = Math.ceil(Math.random() * seed);
    dat.setDate(dat.getDate() + 1);
  }
  return returnData;
}

var aqiSourceData = {
  "北京": randomBuildData(500),
  "上海": randomBuildData(300),
  "广州": randomBuildData(200),
  "深圳": randomBuildData(100),
  "成都": randomBuildData(300),
  "西安": randomBuildData(500),
  "福州": randomBuildData(100),
  "厦门": randomBuildData(100),
  "沈阳": randomBuildData(500)
};

// 用于渲染图表的数据
var chartData = [];

// 记录当前页面的表单选项
var pageState = {
  nowSelectCity: -1,
  nowGraTime: "day"
}

/**
 * 渲染图表
 */
function renderChart() {
  for(var randomData in aqiSourceData[pageState.nowSelectCity]){ 
    var chartValue = aqiSourceData[pageState.nowSelectCity][randomData]; //获取键值对的值
    chartData.push(chartValue); //获得对应城市的AQI
  }
  // for (var i = 0; i < aqiSourceData.length; i++) {
  //   chartData[i] = aqiSourceData[pageState.nowSelectCity];
  // }
 
  toDrawingChart(chartData);
  // toDrawingChart([1, 15, 26, 32, 33, 44, 55, 66, 57, 88, 92, 67, 42, 45, 61, 105, 33, 24, 15, 36, 27, 28, 29, 10, 22]); 
  
  //鼠标滑动，显示提示信息 
  toShowTipMessage();

}

/*Array 数组扩展*/ 
Array.prototype.max = function () { 
  return Math.max.apply({}, this); 
}; 

Array.prototype.min = function () { 
  return Math.min.apply({}, this); 
}; 

//绘制24小时分时段呼入图形报表的函数 
function toDrawingChart(/*String*/inCallsPerHour) { 
  var chartWrap = document.getElementById("aqi-chart-wrap"); //页面上唯一的一个div，作为图表的容器 
  var eachWidth = (700 - 15 - 30) / inCallsPerHour.length;
  if (inCallsPerHour != null) { 
    var inCallMax = inCallsPerHour.max(); //从传入的数组中取得数组最大值，用到了一个自己写的array的扩展方法max() 
    var topOffsetPercent = 275 / inCallMax; //计算以最大值为基准的每像素显示比例，百分比 
    for (var i = 0; i < inCallsPerHour.length; i++) { //循环24小时数据 
      var sumrow = document.createElement("div"); //创建一个div元素sumrow 
      sumrow.id = "sumrow_" + i + "_" + inCallsPerHour[i];//为刚刚创建的div元素sumrow添加id属性（这里把时间，呼入电话总量数据写入到id中，后面显示这些信息的时候有用） 
      sumrow.setAttribute("class", "incallchartsumrow"); //添加属性 
      //设置元素的left（每个div宽度为10px，那么第i个元素就应该是i*10，因为还有一列10像素的组装图，所以还要*2，加上距离左侧40px边距 + 每2个柱状图为一组之间的间隔空隙6px，所以得出如下，） 
      sumrow.style.left = i * (eachWidth + 0) + (i * 0) + 40 + "px"; 
      //高度的计算，Math.round四舍五入取值，百分比的基数 乘以 当前时段的呼入数据，为统计图的高度 
      sumrow.style.height = Math.round(topOffsetPercent * inCallsPerHour[i]) + "px"; 
      sumrow.style.width = (eachWidth - 1) + "px"; //宽度10px像素 
      sumrow.style.position = "absolute"; //绝对定位 
      sumrow.style.overflow = "hidden"; //超出部分隐藏 
      sumrow.style.background = "none repeat scroll 0 0 #1280ef"; //背景颜色 
      sumrow.style.display = "block"; //块状显示 
      //距离容器上边框的距离，图表高度200 减去 当前这个柱状图图表高度 
      sumrow.style.top = (25 + 6 + 220 + 55) - Math.round(topOffsetPercent * inCallsPerHour[i]) + "px"; 
      chartWrap.appendChild(sumrow); //将创建的sumcow元素添加到chartWrap容器中去 
      var timerow = document.createElement("div"); 
      timerow.id = "timerow_" + i; 
      timerow.setAttribute("class", "callnum"); 
      timerow.style.left = i * (eachWidth + 0) + (i * 0) + 40 + "px"; 
      timerow.style.width = (eachWidth - 1) + "px"; 
      timerow.style.position = "absolute"; 
      timerow.style.top = "306px"; //Y轴为0
      var timerowId;
      if(i % 5 == 0){
        timerowId = i;
      } else{
        timerowId = "";
      }
      timerow.innerHTML = '<span style="font-size:12px; color:#666666;"> ' + timerowId + '</span>'; 
      chartWrap.appendChild(timerow); 
    } 

    //绘制标尺线 
    for (var i = 0; i < 5; i++) { 
      var tity = document.createElement("div"); 
      tity.setAttribute("class", "tity"); 
      tity.style.width = "30px"; 
      tity.style.position = "absolute"; 
      tity.style.top = (55 * i) + 25 + "px"; 
      tity.style.left = "15px"; 
      tity.innerHTML = '<span style="font-size:12px; color:#666666;"> ' + Math.round(inCallMax - (inCallMax / 5) * i) + '</span>'; 
      chartWrap.appendChild(tity); 
      var liney = document.createElement("div"); 
      liney.setAttribute("style", "width:655px; left:40px; border-top:1px dotted #B9B9B9; height:1px; line-height:1px; display:block; overflow:hidden; position:absolute; "); 
      liney.style.top = (55 * i) + (25 + 6) + "px"; 
      chartWrap.appendChild(liney); 
    } 
  } else { 
  icArea.innerHTML = '<div style="color:#0066cc; font-size:12px; margin:20px 0 0 80px;">暂无统计数据</div>'; 
  } 
} 

//鼠标提示显示详细数据 
function toShowTipMessage() { 
  var nodes = document.getElementById("aqi-chart-wrap").getElementsByTagName("div"); 
  for (var i = 0; i < nodes.length; i++) { 
    nodes[i].onmouseover = function () { 
      var temp = this.id.split("_"); 
      var type = temp[0]; 
      var data = temp[1]; 
      var times = temp[2]; 
      var tipMessage = ""; 
      var tip = document.createElement("div"); 
      tip.id = "TipMessage"; 
      tip.style.position = "absolute"; 
      tip.style.top = (parseInt(document.getElementById(this.id).style.top.replace("px", "")) - 20) + "px"; 
      tip.style.left = document.getElementById(this.id).style.left; 
      if (type == "sumrow") { 
        tipMessage = "日期:" + data + "，AQI:" + times; 
      } else if (type == "cptrow") { 
      tipMessage = "日期:" + data + "AQI:" + times; 
      } 
      tip.innerHTML = '<span style="font-size:12px; display:block; height:20px; background-color:#ffffff; padding:0px 2px; line-height:20px;">' + tipMessage + '</span>'; 
      document.getElementById("aqi-chart-wrap").appendChild(tip); 
    } 
    nodes[i].onmouseout = function () { 
    var tip = document.getElementById("TipMessage"); 
    document.getElementById("aqi-chart-wrap").removeChild(tip); 
    } 
  } 
} 

/**
 * 日、周、月的radio事件点击时的处理函数
 */
function graTimeChange(changedGraTime) {
  // 确定是否选项发生了变化 
  // 设置对应数据
  for (var i = 0; i<changedGraTime.length; i++) {
    if (changedGraTime[i].checked) {
      if (chk==i) {
        alert("radio值没有改变!!!"); 
      } else{
        chk = i;
        pageState.nowGraTime = changedGraTime[i].value; 
        alert("现在变成的日期粒度是："+pageState.nowGraTime);
        // 调用图表渲染函数
        renderChart();
      }
      break;
    }
  }
}

/**
 * select发生变化时的处理函数
 */
function citySelectChange(changedCity) {
  // 确定是否选项发生了变化 
  // 设置对应数据
  pageState.nowSelectCity = changedCity;
  alert("现在变成的城市是："+pageState.nowSelectCity);
  // 调用图表渲染函数
  renderChart();
}

/**
 * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
 */
var chk = 0;
function initGraTimeForm() {
  var select = document.getElementsByName("gra-time"); 
  for (var i = 0; i<select.length; i++) {
    if (select[i].checked) {
      chk = i;
      pageState.nowGraTime = select[i].value; 
      alert("还未改变，现在的日期粒度是："+pageState.nowGraTime);
    }
    select[i].onclick = function(){graTimeChange(select)};
  }
}

/**
 * 初始化城市Select下拉选择框中的选项
 */
function initCitySelector() {
  // 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
  var select = document.getElementById("city-select");
  select.options.length = 0; //初始化select列表
  for(var city in aqiSourceData){ 
    var getCityName = city; //属性名称:城市名
    // var value = aqiSourceData[city]; //属性对应的值:对象类型
    var option = new Option(getCityName);
    select.options.add(option);
  }
  pageState.nowSelectCity = select.value; 
  alert("还未改变，现在的城市是："+pageState.nowSelectCity);

  // 给select设置事件，当选项发生变化时调用函数citySelectChange
  select.onchange = function(){citySelectChange(select.value)};
  // return citySelectChange(); //返回：选择的城市
}

/**
 * 初始化图表需要的数据格式
 */
function initAqiChartData(/*String*/selectedCity) {
  // 将原始的源数据处理成图表需要的数据格式
  // 处理好的数据存到 chartData 中
  chartData = selectedCity;
}

/**
 * 初始化函数
 */
function init() {
  // renderChart();
  initGraTimeForm()
  initCitySelector();
  renderChart();
  // console.log(selectedCity);
  // initAqiChartData(selectedCity);
}

window.onload = function(){
  init();
}



