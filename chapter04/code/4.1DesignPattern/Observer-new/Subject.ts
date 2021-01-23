import Observer from './Observer'

/**
 * 发布者
 * subject接口，代表订阅者操作的接口
 */
export default interface ISubject {
    state: number;
    //注册订阅
    register(observer: Observer): void;
    //取消订阅
    remove(observer: Observer): void;
    //通知订阅者
    notify(): void;
}
