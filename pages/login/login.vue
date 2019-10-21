<template>
    <view class="content">
		<view class="user-avatar" style="flex-direction: row">
			<button type="primary" size="mini" @tap="ava_change('prev')" style="left: 10%;">左</button>
			<view class="oauth-image">
				<image :src="src"></image>
			</view>
			<button type="primary" size="mini" @tap="ava_change('next')" style="right: 10%;">右</button>
		</view>
        <view class="input-group" style="margin-top: 20px;">
            <view class="input-row">
                <input class="m-input" type="text" clearable focus v-model="account" placeholder="姓名"></input>
            </view>
        </view> 
		<view class="input-group">
            <view class="input-row">
                <input type="number" displayable clearable v-model="zjzh" placeholder="资金账号"></input>
            </view>
        </view>
        <view class="btn-row">
            <button type="primary" class="primary" @tap="bindLogin">下一步</button>
        </view>
        <view class="action-row">
            <navigator url="./idLogin">忘记账号</navigator>
            <text>|</text>
            <navigator url="../KH/kh">新开户</navigator>
        </view>
        <view class="oauth-row" v-if="hasProvider" v-bind:style="{top: positionTop + 'px'}">
            <view class="oauth-image" v-for="provider in providerList" :key="provider.value">
                <image :src="provider.image" @tap="oauth(provider.value)"></image>
            </view>
        </view>
    </view>
</template>

<script>
    import service from '../../service.js';
    import {
        mapState,
        mapMutations
    } from 'vuex'
    import mInput from '../../components/m-input.vue'

    export default {
        components: {
            mInput
        },
        data() {
            return {
				img: 0,
				src: '',
				dir: '../../static/img/avatar/',
				srcList: ["a.png", "b.png", "c.png", "d.png", "e.png", "f.png", "g.png", "h.png", "i.png", "j.png", "k.png", "l.png", "m.png", "n.png", "o.png", "p.png", "r.png", "s.png"], 
                providerList: [],
                hasProvider: true,
                account: '',
                zjzh: '',
                positionTop: 0
            }
        },
        computed: mapState(['forcedLogin']),
        methods: {
            ...mapMutations(['login']),
            initProvider() {
                const filters = ['weixin', 'qq', 'sinaweibo'];
                uni.getProvider({
                    service: 'oauth',
                    success: (res) => {
                        if (res.provider && res.provider.length) {
                            for (let i = 0; i < res.provider.length; i++) {
                                if (~filters.indexOf(res.provider[i])) {
                                    this.providerList.push({
                                        value: res.provider[i],
                                        image: '../../static/img/' + res.provider[i] + '.png'
                                    });
                                }
                            }
                            this.hasProvider = true;
                        }
                    },
                    fail: (err) => {
                        console.error('获取服务供应商失败：' + JSON.stringify(err));
                    }
                });
            },
            initPosition() {
                /**
                 * 使用 absolute 定位，并且设置 bottom 值进行定位。软键盘弹出时，底部会因为窗口变化而被顶上来。
                 * 反向使用 top 进行定位，可以避免此问题。
                 */
                this.positionTop = uni.getSystemInfoSync().windowHeight - 100;
            },
            bindLogin() {
                if (this.account.length < 1) {
                    uni.showToast({
                        icon: 'none',
                        title: '姓名不能为空'
                    });
                    return;
                }
                if (!this.zjzh.replace('/[^\d]/g', '')) {
                    uni.showToast({
                        icon: 'none',
                        title: '请输入正确的资金账号！'
                    });
                    return;
                }
				let _self = this;
				uni.request({
					url: 'https://rpa.slave.haqh.com:8088',
					data: {account:this.account, zjzh:this.zjzh},
					method: 'POST',
					dataType: 'json',
					success: (json) => {
						if (200 != json.code) {
						    _self.toMain(_self.account);
						} else {
						    uni.showToast({
						        icon: 'none',
						        title: '姓名或资金账号不正确',
						    });
						}
					},fail: (e)=>{
						console.log(e);
					}
				});
            },
            oauth(value) {
                uni.login({
                    provider: value,
                    success: (res) => {
                        uni.getUserInfo({
                            provider: value,
                            success: (infoRes) => {
								console.log(infoRes);
                                /**
                                 * 实际开发中，获取用户信息后，需要将信息上报至服务端。
                                 * 服务端可以用 userInfo.openId 作为用户的唯一标识新增或绑定用户信息。
                                 */
                                this.toMain(infoRes.userInfo.nickName);
                            }
                        });
                    },
                    fail: (err) => {
                        console.error('授权登录失败：' + JSON.stringify(err));
                    }
                });
            },
            toMain(userName) {
                this.login(userName);
                /**
                 * 强制登录时使用reLaunch方式跳转过来
                 * 返回首页也使用reLaunch方式
                 */
                if (this.forcedLogin) {
                    uni.reLaunch({
                        url: '../HA-chat/chat',
                    });
                } else {
                    uni.navigateBack();
                }
            },
			ava_change(type){
				let img = this.img;
				if('prev' == type){
					img--;
					if(img < 0){
						img = this.srcList.length - 1;
					}
				}else{
					img++;
					if(img >= this.srcList.length){
						img = 0;
					}
				}
				this.img = img;
				this.src = this.dir + this.srcList[img];
			},
			go(url){
				window.location.href = url;
			}
        },
		//设置初始头像
		onLoad() {
			this.src = this.dir + this.srcList[this.img];
		},
        onReady() {
            this.initPosition();
            this.initProvider();
        }
    }
</script>

<style>
    .action-row {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    .action-row navigator {
        color: #007aff;
        padding: 0 10px;
    }

    .oauth-row {
        display: flex;
        flex-direction: row;
        justify-content: center;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
    }

    .oauth-image {
        width: 50px;
        height: 50px;
        border: 1px solid #dddddd;
        border-radius: 50px;
        margin: 0 20px;
        background-color: #ffffff;
    }

    .oauth-image image {
        width: 30px;
        height: 30px;
        margin: 10px;
    }
	.user-avatar{
		display: flex;
		flex-flow: row;
		margin-top: 20px;
	}
	.user-avatar image{
		width: 40px;
		height: 40px;
		margin: 5px;
	}
	.user-avatar button{
		padding: 0;
		line-height: 25px;
		height: 25px;
		width: 30px;
		margin-top: 3%;
		background-color: #86C953;
	}
	.input-group input{
		display: block;
		margin: 0 auto;
		width: 100%;
		height: 40px;
		border: 2px solid #e5e5e5;
		font-weight: bold;
		font-size: 12px;
		color: #999;
		padding: 0 10px;
		border-radius: 3px;
		background-color: #fff;
	}
</style>
