// ==UserScript==
// @name         优学院刷课
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  优学院自动8倍速观看视频，自动答题
// @author       xiaobu
// @match        https://ua.ulearning.cn/learnCourse/learnCourse.html?*
// ==/UserScript==


(function () {

    var startBtn = null;
    var stopBtn = null;
    var inter = null;
    var startWatch = null;
    var stopWatch = null;

    bindEvent();
    createBtn();

    document.querySelector('.operating-area').removeChild(document.querySelector('.custom-service'));
    document.querySelector('.operating-area').appendChild(startBtn);

    // 创建全局元素
    function createBtn() {
        // ===== 定义开始按钮 ===== //
        startBtn = document.createElement("div");
        startBtn.setAttribute("class", "custom-service");
        startBtn.setAttribute("style", "z-index:9999");
        startBtn.innerHTML = '<button class="btn-hollow"><span>老铁开刷</span></button>';
        startBtn.onclick = () => {
            startWatch();
        }

        // ===== 定义暂停按钮 =====  //
        stopBtn = document.createElement("div");
        stopBtn.setAttribute("class", "custom-service");
        stopBtn.setAttribute("style", "z-index:9999");
        stopBtn.innerHTML = '<button class="btn-hollow"><span>爷不刷了</span></button>';
        stopBtn.onclick = () => {
            stopWatch();
        }
    }

    // 定义全局事件
    function bindEvent() {

        startWatch = function () {
            document.querySelector('.operating-area').removeChild(startBtn);
            document.querySelector('.operating-area').appendChild(stopBtn);
            inter = setInterval(function () {
                logic();
            }, 1000);
        };

        stopWatch = function () {
            document.querySelector('.operating-area').removeChild(stopBtn);
            document.querySelector('.operating-area').appendChild(startBtn);
            // 如果页面有视频，且视频是正在观看状态，需要停止
            if (document.querySelector(".file-media")) {
                let allVideos = document.querySelectorAll(".file-media");
                for (let i = 0; i < allVideos.length; i++) {
                    if (document.querySelectorAll('.mejs__button.mejs__playpause-button button')[i].getAttribute('title') != 'Play') {
                        document.querySelectorAll(".mejs__speed-selector-input")[i].value = 1.50;
                        document.querySelectorAll(".mejs__speed-selector-input")[i].click();
                        document.querySelectorAll('.mejs__button.mejs__speed-button button')[i].innerText = '1.50x'
                        document.querySelectorAll('.mejs__button.mejs__playpause-button button')[i].click();
                    }
                }
            }
            clearInterval(inter);
        };
    }

    // 刷课逻辑
    function logic() {
        console.log('执行逻辑中>>>');

        // 如果页面中弹出了对话框
        if (document.querySelector('.modal.fade.in')) {
            // 统计弹框
            if (document.querySelector('.modal.fade.in').getAttribute('id') == 'statModal') {
                document.querySelectorAll("#statModal .btn-hollow")[1].click();
                console.log('干掉统计弹框~');
            }
            // 提示框
            else if (document.querySelector('.modal.fade.in').getAttribute('id') == 'alertModal') {
                if (document.querySelector("#alertModal .btn-hollow")) {
                    document.querySelector("#alertModal .btn-hollow").click();
                }
                else {
                    document.querySelector("#alertModal .btn-submit").click();
                }
                console.log('干掉提示框~');
            }
            return;
        }



        // 如果页面中有视频
        if (document.querySelector(".file-media")) {
            let allVideos = document.querySelectorAll(".file-media");
            let i = 0;
            for (; i < allVideos.length; i++) {
                // 已经看完了，跳到到下一页，由于判断是否刷完的逻辑有些复杂， 故不做判断，可以自己手动返回
                if (document.querySelectorAll("[data-bind='text: $root.i18nMessageText().finished']")[i]) {
                    console.log(document.querySelector('.course-title.small').innerText + '  >>> 看完了~');
                }
                // 还没有看完，需要将本视频看完
                else {
                    // 如果本视频不是正在观看状态，则高倍速开始播放
                    if (document.querySelectorAll('.mejs__button.mejs__playpause-button button')[i].getAttribute('title') == 'Play') {
                        console.log('火力全开!目标：' + document.querySelector('.course-title.small').innerText);

                        document.querySelectorAll(".mejs__speed-selector-input")[i * 4].value = 8.00;
                        document.querySelectorAll(".mejs__speed-selector-input")[i * 4].click();
                        document.querySelectorAll('.mejs__button.mejs__speed-button button')[i].innerText = '8.00x'
                        document.querySelectorAll('.mejs__button.mejs__playpause-button button')[i].click();
                    }
                    break;
                }
            }
            if (i == allVideos.length) {
                document.querySelector('.next-page-btn.cursor').click();
            }
        }
        // 如果是做题界面
        else if (document.querySelector('.question-setting-panel')) {
            console.log('精神小伙开始答题！！');

            autoAnswer();
            setTimeout(() => {
                autoAnswer();
                // 下一页
                document.querySelector('.next-page-btn.cursor').click();
            }, 500)

        }
        // 直接下一页
        else {
            document.querySelector('.next-page-btn.cursor').click();
        }
    }

    // 自动答题
    function autoAnswer() {
        // 点一下提交拉取答案
        let content = document.querySelector('.question-operation-area button').innerText;
        if (content == '重做') {
            document.querySelector('.question-operation-area button').click();
        }
        document.querySelector('.question-operation-area button').click();

        let answers = document.querySelectorAll('.correct-answer-area');
        // 存放题目
        let questionRootNodes = [];
        for (let i = 0; i < answers.length; i++) {
            questionRootNodes.push(answers[i].parentNode.parentNode.parentNode);
        }

        document.querySelector('.question-operation-area button').click();

        for (let i = 0; i < answers.length; i++) {
            // 答案节点的内容
            let answer = answers[i].querySelector('span:nth-child(2)').innerText;

            // 判断题
            if (answer == '正确') {
                questionRootNodes[i].querySelector('.right-btn').click();
            }
            else if (answer == '错误') {
                questionRootNodes[i].querySelector('.wrong-btn').click();
            }
            // 多选题
            else if (answer.indexOf(',') != -1) {
                // 所有已经选择的项去掉
                let allSelectedBox = questionRootNodes[i].querySelectorAll('.checkbox.selected');
                for (let i = 0; i < allSelectedBox.length; i++) {
                    allSelectedBox[i].click();
                }
                // 重新选择
                let answerArray = answer.split(',');

                let allBox = questionRootNodes[i].querySelectorAll('.checkbox');
                for (let i = 0; i < answerArray.length; i++) {
                    console.log(answerArray[i]);

                    switch (answerArray[i]) {
                        case 'A': {
                            allBox[0].click();
                            console.log('选择了 A');
                            break;
                        }
                        case 'B': {
                            allBox[1].click();
                            console.log('选择了 B');
                            break;
                        }
                        case 'C': {
                            allBox[2].click();
                            console.log('选择了 C');
                            break;
                        }
                        case 'D': {
                            allBox[3].click();
                            console.log('选择了 D');
                            break;
                        }
                        case 'E': {
                            allBox[4].click();
                            console.log('选择了 E');
                            break;
                        }
                    }
                }
            }
            // 单选题
            else {
                let allBox = questionRootNodes[i].querySelectorAll('.radio');
                switch (answer) {
                    case 'A': {
                        allBox[0].click();
                        console.log('选择了 A');
                        break;
                    }
                    case 'B': {
                        allBox[1].click();
                        console.log('选择了 B');
                        break;
                    }
                    case 'C': {
                        allBox[2].click();
                        console.log('选择了 C');
                        break;
                    }
                    case 'D': {
                        allBox[3].click();
                        console.log('选择了 D');
                        break;
                    }
                    case 'E': {
                        allBox[4].click();
                        console.log('选择了 E');
                        break;
                    }
                }
            }
        }
        // 真正提交
        document.querySelector('.question-operation-area button').click();

    }

})();

