<template>
    <view class="content">
		<view class="user-avatar" style="flex-direction: row">
			<button type="primary" size="mini" @tap="ava_change('prev')" style="left: 10%;">左</button>
			<view class="oauth-image">
				<image :src="src"></image>
			</view>
			<button type="primary" size="mini" @tap="ava_change('next')" style="right: 10%;">右</button>
		</view>
        <view class="input-group" style="margin-top: 20px;background-color: none;">
            <view class="input-row">
                <input class="m-input" type="text" clearable focus v-model="account" placeholder="姓名"></input>
            </view>
            <view class="input-row" style="margin-top:30px;">
                <input type="number" displayable clearable v-model="zjzh" placeholder="资金账号"></input>
            </view>
        </view>
        <view class="btn-row">
            <button type="primary" class="primary" @tap="bindLogin">下一步</button>
        </view>
        <view class="action-row">
            <navigator url="../reg/reg">注册账号</navigator>
            <text>|</text>
            <navigator url="../pwd/pwd">忘记密码</navigator>
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
                /**
                 * 客户端对账号信息进行一些必要的校验。
                 * 实际开发中，根据业务需要进行处理，这里仅做示例。
                 */
                if (this.account.length < 5) {
                    uni.showToast({
                        icon: 'none',
                        title: '账号最短为 5 个字符'
                    });
                    return;
                }
                if (this.zjzh.length < 6) {
                    uni.showToast({
                        icon: 'none',
                        title: '密码最短为 6 个字符'
                    });
                    return;
                }
                /**
                 * 下面简单模拟下服务端的处理
                 * 检测用户账号密码是否在已注册的用户列表中
                 * 实际开发中，使用 uni.request 将账号信息发送至服务端，客户端在回调函数中获取结果信息。
                 */
                const data = {
                    account: this.account,
                    password: this.zjzh
                };
                const validUser = service.getUsers().some(function (user) {
                    return data.account === user.account && data.password === user.password;
                });
                if (validUser) {
                    this.toMain(this.account);
                } else {
                    uni.showToast({
                        icon: 'none',
                        title: '用户账号或密码不正确',
                    });
                }
            },
            oauth(value) {
                uni.login({
                    provider: value,
                    success: (res) => {
                        uni.getUserInfo({
                            provider: value,
                            success: (infoRes) => {
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
                        url: '../main/main',
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
