// ==UserScript==
// @name         GameMale 你画我猜成图上传工具
// @namespace    https://www.gamemale.com
// @version 2.3
// @description  一键上传成图，支持本地文件和链接图片
// @author       Higanoneko & user_login & 阿不思的落胤
// @match        https://www.gamemale.com/plugin.php?id=viewui_draw&mod=list&ac=draw
// @grant        none
// ==/UserScript==

window.onload = (function() {
    'use strict';

    var padding=30;
    var par=document.getElementsByClassName("btn")[0];
    var ct=document.getElementsByClassName("canvas")[0].childNodes[0];
    var ctx=ct.getContext("2d");
    var devicePixelRatio=window.devicePixelRatio||1;
    var backingStoreRatio=ctx.webkitBackingStorePixelRatio||1;
    var ratio=devicePixelRatio/backingStoreRatio;ctx.scale(ratio,ratio);
    padding=padding*ratio;ct.style.borderWidth='1px';
    ct.style.borderStyle='solid';
    var img=new Image();
    img.onload=function(){
        var sh=347*ratio;
        var sw=500*ratio;
        var h=img.height;
        var w=img.width;
        var ph=sh-padding*2;
        var pw=sw-padding*2;
        ct.height=sh;
        ct.width=sw;
        ct.style.height=sh;
        ct.style.width=sw;
        ctx.clearRect(0,0,ct.width,ct.height);
        if(w/h>=pw/ph){
            h=h*(pw/w);
            w=pw;
            ctx.drawImage(img,padding,padding+(ph-h)/2,w,h)
        }else{
            w=w*(ph/h);
            h=ph;
            ctx.drawImage(img,padding+(pw-w)/2,padding,w,h)
        }
    };

    function selectImage(file){
        if(!file.files||!file.files[0]) return;
        var reader=new FileReader();
        reader.onload=function(evt){
            img.src=evt.target.result
        };
        reader.readAsDataURL(file.files[0])
    }

    function loadImageFromUrl(url){
        if(!url) return;
        var testImg=new Image();
        testImg.crossOrigin='anonymous';
        testImg.onload=function(){
            img.crossOrigin='anonymous';
            img.src=url
        };
        testImg.onerror=function(){
            img.crossOrigin=null;
            img.src=url
        };
        testImg.src=url
    }

    // 在原有按钮后面添加"导入图片"按钮
    var uploadBtn=document.createElement('button');
    uploadBtn.textContent='导入图片';
    uploadBtn.title='从本地或链接导入图片';
    uploadBtn.style.cssText='margin-left:10px;background:#1c74a1;color:#FFF;border:1px solid #16608a;padding:4px 12px;cursor:pointer;';
    uploadBtn.addEventListener('click', showUploadDialog);
    par.appendChild(uploadBtn);

    function showUploadDialog(){
        // Discuz! 风格遮罩层
        var mask=document.createElement('div');
        mask.id='gm_upload_mask';
        mask.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:#000;opacity:0.5;z-index:1100;';

        // Discuz! 风格浮窗
        var dlg=document.createElement('div');
        dlg.id='gm_upload_dialog';
        dlg.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1101;width:440px;background:#FFF;border-radius:4px;box-shadow:0 0 25px rgba(0,0,0,0.4);overflow:hidden;font-size:13px;';

        // 标题栏 (Discuz! 蓝色主题)
        var header=document.createElement('div');
        header.style.cssText='background:#2B7ACD;color:#FFF;padding:10px 15px;font-size:14px;font-weight:bold;cursor:default;';
        header.textContent='导入图片到画板';

        // 关闭按钮 (Discuz! 风格 X)
        var headerClose=document.createElement('span');
        headerClose.textContent='\u00d7';
        headerClose.style.cssText='float:right;cursor:pointer;font-size:18px;line-height:1;opacity:0.8;';
        headerClose.addEventListener('mouseover', function(){ this.style.opacity='1'; });
        headerClose.addEventListener('mouseout', function(){ this.style.opacity='0.8'; });
        headerClose.addEventListener('click', closeDialog);
        header.appendChild(headerClose);
        dlg.appendChild(header);

        // 内容区
        var content=document.createElement('div');
        content.style.cssText='padding:20px 25px;';

        // 本地文件上传
        var section1=document.createElement('div');
        section1.style.cssText='margin-bottom:18px;';
        var label1=document.createElement('div');
        label1.style.cssText='margin-bottom:6px;font-weight:bold;color:#333;';
        label1.textContent='本地图片：';
        section1.appendChild(label1);

        var fileInput=document.createElement('input');
        fileInput.type='file';
        fileInput.accept='image/*';
        fileInput.style.cssText='display:block;';
        fileInput.addEventListener('change', function(){
            selectImage(fileInput);
        });
        section1.appendChild(fileInput);
        content.appendChild(section1);

        // 分隔
        var sep=document.createElement('div');
        sep.style.cssText='border-top:1px dashed #DDD;margin:15px 0;';
        content.appendChild(sep);

        // URL链接加载
        var section2=document.createElement('div');
        var label2=document.createElement('div');
        label2.style.cssText='margin-bottom:6px;font-weight:bold;color:#333;';
        label2.textContent='图片链接：';
        section2.appendChild(label2);

        var urlWrap=document.createElement('div');
        urlWrap.style.cssText='display:flex;gap:8px;';
        var urlInput=document.createElement('input');
        urlInput.type='text';
        urlInput.placeholder='粘贴图片URL地址';
        urlInput.style.cssText='flex:1;padding:6px 8px;border:1px solid #CCC;border-radius:3px;font-size:13px;';
        urlWrap.appendChild(urlInput);

        var urlBtn=document.createElement('button');
        urlBtn.textContent='加载';
        urlBtn.style.cssText='padding:6px 16px;background:#2B7ACD;color:#FFF;border:none;border-radius:3px;cursor:pointer;font-size:13px;';
        urlBtn.addEventListener('mouseover', function(){ this.style.background='#2365A8'; });
        urlBtn.addEventListener('mouseout', function(){ this.style.background='#2B7ACD'; });
        urlBtn.addEventListener('click', function(){
            loadImageFromUrl(urlInput.value.trim());
        });
        urlWrap.appendChild(urlBtn);
        section2.appendChild(urlWrap);
        content.appendChild(section2);

        dlg.appendChild(content);

        // 底部 (Discuz! 风格)
        var footer=document.createElement('div');
        footer.style.cssText='text-align:right;padding:10px 15px;background:#F5F5F5;border-top:1px solid #E5E5E5;';

        var closeBtn=document.createElement('button');
        closeBtn.textContent='关闭';
        closeBtn.style.cssText='padding:5px 20px;background:#FFF;border:1px solid #CCC;border-radius:3px;cursor:pointer;font-size:13px;';
        closeBtn.addEventListener('click', closeDialog);
        footer.appendChild(closeBtn);

        dlg.appendChild(footer);

        // 遮罩点击关闭
        mask.addEventListener('click', closeDialog);

        function closeDialog(){
            if(mask.parentNode) mask.parentNode.removeChild(mask);
            if(dlg.parentNode) dlg.parentNode.removeChild(dlg);
        }

        // ESC关闭
        function escHandler(e){
            if(e.keyCode===27){ closeDialog(); document.removeEventListener('keydown', escHandler); }
        }
        document.addEventListener('keydown', escHandler);

        document.body.appendChild(mask);
        document.body.appendChild(dlg);
        urlInput.focus();
    }
})();