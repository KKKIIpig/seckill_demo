

// 存放主要的交互逻辑 js 代码

var seckill ={
    // 封装秒杀相关的 ajax 的 url
    _URL : {
        now : function () {
            return '/seckill/time/now';
        },
        exposer : function (seckillId) {
            return '/seckill/'+seckillId+'/exposer';
        },
        execution : function (seckillId, md5) {
            return '/seckill/'+seckillId+'/'+md5+'/execution';
        }
    },
    // 秒杀逻辑
    handleSeckillkill : function (seckillId, node){
        // 获取秒杀地址，控制显示逻辑，执行秒杀
        node.hide()
            .html('<button class="btn btn-primary btn-lg" id="killBtn"> 开始秒杀 </button>');  //按钮（还是隐藏的）
         $.post(seckill._URL.exposer(seckillId),{},function (result) {
            // 在回调函数中，执行秒杀流程
             if (result && result['success']) {
                 var exposer = result['data'];
                 if (exposer['exposed']){
                     // 开启秒杀
                     var md5 = exposer['md5'];
                     var killUrl = seckill._URL.execution(seckillId,md5);  //获得秒杀的URL
                     console.log('killURL:'+killUrl);
                     $('#killBtn').one('click',function () {  //为什么用one不用click绑定，因为click是一直绑定，one是只绑定一次，这样子就可以防止服务器端接收到大量的相同url请求。
                         // 执行秒杀请求
                         // 1. 禁用按钮
                         $(this).addClass('disabled');
                         // 2.发送秒杀请求 绑定按钮事件
                         $.post(killUrl, {}, function(result) {
                             if (result && result['success']) {
                                 var killResult = result['data'];
                                 var state = killResult['state'];
                                 var stateInfo = killResult['stateInfo'];
                                 // 3.显示秒杀结果
                                 node.html('<span class="label label-success">' + stateInfo + '</span>');
                             }
                         });
                     });
                     node.show();
                 } else {
                     // 未开启秒杀 ， 每个用户浏览器会有时间偏差，再重新倒计时一次
                     var now = exposer['now'];
                     var start = exposer['start'];
                     var end = exposer['end'];
                     // 重新计算计时逻辑
                     seckill.countdown(seckillId, now, start, end);
                 }
             } else {
                 console.log('result=' + result);
             }
         })

    },

    // 验证手机号
    validatePhone: function (phone) {
        //直接判断对象会看对象是否为空,空就是undefine就是false; isNaN 非数字返回true
        if (phone && phone.length == 11 && !isNaN(phone)) {
            return true;
        } else {
            return false;
        }
    },
    //判断秒杀是否开启
    countdown:function(seckillId, nowTime, startTime, endTime){
        let seckillBox = $('#seckill-box');  //展示计时区域
        // 时间判断
        if (nowTime > endTime){
            seckillBox.html('秒杀结束！')
        } else if( nowTime < startTime){
            // 秒杀未开始，计时事件绑定
            var killTime = new Date(startTime + 1000);  //加上1秒是因为防止计时时间的偏移
            seckillBox.countdown(killTime, function (event) {  //使用jquery的计时插件，以killtime作为基准时间，每次变化时都会调用回调函数根据格式输出到span中显示
                var format = event.strftime('秒杀倒计时: %D天 %H时 %M分 %S秒');
                seckillBox.html(format);
                /*时间完成后回调函数*/
            }).on('finish.countdown',function () {
                // 秒杀开始， 获取秒杀地址，显示秒杀按钮，控制逻辑
                seckill.handleSeckillkill(seckillId,seckillBox);
            });
        } else {
            // 秒杀开始
            seckill.handleSeckillkill(seckillId,seckillBox);
        }
    },

    //详情页秒杀逻辑
    detail: {
        //详情页初始化
        init: function (params) {
            //手机验证和登录，计时交互
            //规划交互流程
            //在cookie中查找手机号(因为没有用后端去存放用户信息，所以我们把用户手机号存入cookie中)
            var killPhone = $.cookie('killPhone');  //若无登录，killPhone为空

            //验证手机号
            if (!seckill.validatePhone(killPhone)) {
                //绑定手机
                //控制输出
                var killPhoneModal = $('#killPhoneModal');  //获取电话弹出层组件
                killPhoneModal.modal({
                    show: true,     //显示弹出层
                    backdrop: 'static',     //禁止位置关闭
                    keyboard: false     //关闭键盘事件
                });

                //填写手机号码弹出层的button事件
                $('#killPhoneBtn').click(function () {
                    var inputPhone = $('#killPhoneKey').val();  //获取手机号
                    console.log("inputPhone: " + inputPhone);   //TODO

                    if (seckill.validatePhone(inputPhone)) {  //再次验证手机号

                        //电话写入cookie(7天过期)，path:cookie只在"/seckill"路径（模块)之下方有效
                        $.cookie('killPhone', inputPhone, {expires: 7, path: '/seckill'});
                        //验证通过 刷新页面
                        window.location.reload();
                    } else {
                        //
                        //todo 错误文案信息抽取到前端字典里
                        //先hide，再填充内容，最后再show一下
                        $('#killPhoneMessage').hide().html('<label class="label label-danger">手机号错误!</label>').show(300);
                    }
                });
            }

            //已经登录
            //计时交互
            var startTime = params['startTime'];
            var endTime = params['endTime'];
            var seckillId = params['seckillId'];

            $.get(seckill._URL.now(),{}, function (result) {  //获取后台系统时间
                if(result && result['success']){
                    let nowTime = result['data'];
                    // 判断时间，进行流程控制
                    seckill.countdown(seckillId, nowTime, startTime, endTime);
                }else {
                    console.log('result:'+result);
                }
            })
        }
    }
}