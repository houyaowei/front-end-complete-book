## 第4章: 前端架构核心思想

掌握牢固的基础是了解架构（或js框架）关键。正所谓“工欲善其事，必先利其器”。如果你有读过js库或框架的经验，你是否有过因为架构基础不牢固而觉得代码晦涩难懂。很明显本章内容将是你需要的。
本章将围绕以下内容进行详细阐述：

1. 框架中常用的6种设计模式。
2. 作为一个标准的前端开发，需要了解的v8知识点。
3. 宏任务和微任务的处理过程是怎么样的。
4. 介绍有哪些异步加载规范。
5. 函数式编程基础
6. 以v-dom和状态原理两个例子入手，深入剖析两者的实现过程。

### 4.1 常用设计模式介绍

#### 4.1.1状态模式

状态模式是一个比较有用的模式，意思是指当一个对象的内部状态发生变化时，会产生不同的行为。

比如说某某牌电灯,按一下按钮打开弱光, 按两下按钮打开强光, 按三下按钮关闭灯光。在我们的想象中，基本的模型应该是如下描述

<img src="./images/4-1-2.png">

状态模式允许对象在内部状态改变时，改变其行为，从对象的角度看好像进行了改变。实际开发中，某处文字可能和模型中的一字段进行关联，根据某一个状态显示不同的内容，这时候状态模式可能是你需要的（当然 switch-case, if-else可以继续）。

状态模式中有几个角色，分别是Context，State，各个子状态的实现。Context中保存了Client端的操作接口，同时也保存子状态的实现，代表着当前状态。抽象类State声明了子状态应该实现的各个方法。

![](/Users/eason/Desktop/github/front-end-complete-book/chapter04/images/state.jpg)

先看下Context的实现

`

 export  default  class  Context  {

   private  state:  State;

   constructor(state:  State)  {

   this.transitionTo(state);

}

public  transitionTo(_s:  State):  void  {

  console.log(`Context: transition to ${(<any>_s).constructor.name}`);

  this.state  =  _s;

  this.state.setContext(this);

}

public  setSlighLight():  void  {

   this.state.slightLight(); 

}

public  setHightLight():  void  {

  this.state.highLight();

}

public  close():  void  {

  this.state.close();

  }

 }

`

在transitionTo方法中改变当前状态，参数为实例化的子状态类。

再看下State的实现及其SlightLightClass的实现，为了篇幅考虑，我们在这里只贴出部分的代码，完整的代码参考[https://github.com/houyaowei/front-end-complete-book/tree/master/chapter04/code/4.1DesignPattern/State](https://github.com/houyaowei/front-end-complete-book/tree/master/chapter04/code/4.1DesignPattern/State)。

`

export  default  abstract  class  State  {

  protected  context:  Context;

  public  setContext(_c:  Context)  {

   this.context  =  _c;

}

public  abstract  slightLight():  void;

public  abstract  highLight():  void;

public  abstract  close():  void;

}

`

> 请注意，如果对TypeScript的抽象类语法还不是很理解的话可以参考官网的class部分。

`

export  default  class  SlighLightClass  extends  State  {

  public  slightLight():  void  {

   console.log("state in SlighLightClass, I will change state to highLight");

   //切换到新的状态

   this.context.transitionTo(new  HighLight());

}

public  highLight():  void  {

  console.log("hightstate state in SlighLightClass");

}

public  close():  void  {

  console.log("close state in SlighLightClass");

 }

}

`

我们来测试下：

`

import Context from  "./Context";

import SlightLight from  "./SlightLightClass";

import CloseLight from  "./CloseClass";

// const context = new Context(new SlightLight());

//我们先用close状态初始化

const context =  new  Context(new  CloseLight());

context.close();

context.setSlighLight();

context.setHightLight();

`

结果如下：

`

Context: transition to ColseClass

state in closeClass, I will change state to slight

Context: transition to SlighLightClass

state in SlighLightClass, I will change state to highLight

Context: transition to HighLightClass

highLight state in HighLightClass

`

现在我们把初始状态调整为SlightState,重新编译、运行

`

Context: transition to SlighLightClass

state in SlighLightClass, I will change state to highLight

Context: transition to HighLightClass

highLight state in HighLightClass

state in hightLight, I will change state to close

Context: transition to ColseClass

`

状态模式封装了转换规则，并枚举了可能的状态。将所有的与某个状态有关的行为放到一个类中，所有可以方便地增加状态。

状态模式的使用必然会增加系统类和对象的个数。 状态模式的结构与实现都较为复杂，如果使用不当将导致程序结构和代码的混乱。 状态模式对"开闭原则"的支持并不太好，对于可以切换状态的状态模式，增加新的状态类需要修改那些负责状态转换的源代码，否则无法切换到新增状态，而且修改某个状态类的行为也需修改对应类的源码。

#### 4.1.2策略模式

策略模式是一种行为模式，它允许定义一系列算法，并将每种算法分别放入独立的类中，在运行时可以相互替换，主要解决的是在多种算法相似的情况下，尽量减少if-else的使用。

策略模式的应用比较广泛，比如年终奖的发放，很多公司都是根据员工的薪资基数和年底绩效考评来计算，比如说以3、6、1方式为例，绩效为3的员工年终奖有2倍工资，绩效为6的员工年终奖为1.2倍工资。

今天我们以一个字符串操作为例进行解释，对数组的sort和reverse方法，定义两种策略，根据需要的策略实例执行对应的策略。

先声明一个策略接口：

`

 interface  Strategy  {

     toHandleStringArray(_d:  string[]):  string[];

}

`

再实现Sort方法的策略实现（这里我们不讨论sort方法的缺陷）

`

class  StrategyAImpl  implements  Strategy  {

    public  toHandleStringArray(_d:  string[]):  string[] {

        //其他业务逻辑

        return  _d.sort();

    }

}

`

接下来看看reverse方法的策略实现

`

class  StrategyBImpl  implements  Strategy  {

    public  toHandleStringArray(_d:  string[]):  string[] {

        //其他业务逻辑

        return  _d.reverse();

    }

}

`

你也许已经发现了，如果我们想实现数组的其他策略，只需要实现对应的接口即可。即能在不扩展类的情况下向用户提供能改变其行为的方法。

到现在还缺少一个关键的零件，改变策略的载体--Context类。

`

class  Context  {

    private  strategy:  Strategy;

    constructor(_s:  Strategy)  {

        this.strategy  =  _s;

}

public  setStrategy(_s:  Strategy)  {

    this.strategy  =  _s;

}

//执行的方法是策略中定义的方法

public  executeStrategy()  {

     //标明是哪个策略类

    console.log(

        `Context: current strategy is ${(<any>this.strategy).constructor.name}`

    );

     const  result  =  this.strategy.toHandleStringArray(names);

     console.log("result:",  result.join("->"));

    }

}

`

我们来测试一下，看效果是怎么样的，先假定Context类中的数组是如下形式的：

`

const names:  string[] = ["hou",  "cao",  "ss"];

`

现在开始实例化reverse方法的策略

`

const context =  new  Context(new  StrategyB());

context.executeStrategy();

`

效果如下：

`

Context: current strategy is StrategyBImpl

result: ss->cao->hou

`

再把策略方式切换到Sort，效果会变成这样的

`

Context: current strategy is StrategyAImpl

result: cao->hou->ss

`

这样的策略实现是不是挺方便的，”任你策略千千万，我仍待你如初恋“。策略模式的程序至少由两部分组层，第一部分是一组策略类，这里面封装了具体的算法，并负责算法的完整实现。第二部分是上下文(即Context)，上下文接受客户端的请求，随后被分发到某个策略类。

策略模式借助组合等思想，可以有效地避免许多不必要的复制、粘贴。同时，对开放-封闭原则进行了完美的支持，将算法封装到具体的策略实现中，易实现、易扩展。

状态可被视为策略的扩展，两者都基于组合机制。它们都通过将部分工作委派给“帮手”来改变其在不同情景下的行为。策略模式下这些对象相互之间完全独立。 状态模式没有限制具体状态之间的依赖，且允许它们自行改变在不同情景下的状态。

#### 4.1.3适配器模式

适配器模式的作用是解决两个接口不兼容的问题。将一个类的接口，转换成客户期望的另一种接口，能够达到相互通信的目的。

现实中，适配器的应用比较广泛。比如说港版的电器插头比大陆版的插头体积要大一些，如果你从香港买了一台Macbook Pro, 我们会发现电源插头是无法插到家里的插座上的，为了一个插头而改造家里已经装修好的插座显然不太合适，那么适配器就显得很有必要了。

还有就是如果你买了一台新版的Macbook Pro, 你发现外接设备的接口类型全部是Type-c,

如果想添加一个非Magic Mouse 鼠标，那么也不好意思，你也需要一个适配器。

下面我们通过简单的代码来描述下该模式。

我们想实现一个音乐播放的方法，常见的音乐文件格式有很多种，如Mp3,Mp4,Wma,Mpeg, RM, Vlc等。音乐播放文件也是五花八门，MediaPlay, 千千静听， RealPlay.....。播放器也不是万能的，不能播放所有的文件格式。

> 维基百科关于音频文件的描述[https://zh.wikipedia.org/wiki/%E9%9F%B3%E9%A2%91%E6%96%87%E4%BB%B6%E6%A0%BC%E5%BC%8F](https://zh.wikipedia.org/wiki/%E9%9F%B3%E9%A2%91%E6%96%87%E4%BB%B6%E6%A0%BC%E5%BC%8F)
> 
> 维基百科关于视频格式的描述
> 
> [https://zh.wikipedia.org/wiki/%E8%A7%86%E9%A2%91%E6%96%87%E4%BB%B6%E6%A0%BC%E5%BC%8F](https://zh.wikipedia.org/wiki/%E8%A7%86%E9%A2%91%E6%96%87%E4%BB%B6%E6%A0%BC%E5%BC%8F)

![](/Users/eason/Desktop/github/front-end-complete-book/chapter04/images/adapter.jpg)

我们先定义一个通用的播放接口

`

export  default  interface  Target  {

    play(type:  string, fileName:  string):  void;

}

`

play方法需要两个参数，类型和文件名。因为我们要根据文件类型做适配，所有这个参数很有必要。

播放接口要支持最常见的音乐文件格式（如Mp3），当然也要支持更丰富的格式，至少可以看个视频吧，体验立马不一样了啊。

我们先定义一个高级播放接口

`

export  default  interface  AdvanceTarget  {

    playVlcType(fileName:  string):  void;

    playMp4Type(fileName:  string):  void;

}

`

实现两个具体的播放类，一个播放VLC格式的，一个播放Mp4格式的。

`

export  default  class  VlcPlayer  implements  AdvancePlayer  {

    public  playVlcType(fileName :  string)  :  void  {

        console.log(`${fileName} is palying!`);

}

    public  playMp4Type(fileName :  string)  :  void  {

        //假定Vlc播放器不能播放mp4格式

    }

}

`

`

export  default  class  Mp4Player  implements  AdvancePlayer  {

    public  playVlcType(fileName:  string):  void  {

        // 假定mp4播放器不支持VLC格式播放

    }

    public  playMp4Type(fileName:  string):  void  {

        console.log(`${fileName} is palying`);

    }

}

`

是时候实现适配器类的时候，以便更好解释适配器是如何架起两种接口的。

`

class  MediaAdatper  implements  Target  {

    private  advanceTarget:  AdvanceTarget;

    constructor(type:  string)  {

        if (type  ===  "vlc") {

            this.advanceTarget  =  new  VlcPlayer();

        }

        if (type  ==  "mp4") {

            this.advanceTarget  =  new  Mp4Player();

        }

    }

public  play(type:  string, fileName:  string):  void  {

    if (type  ===  "vlc") {

        this.advanceTarget.playVlcType(fileName);

    }

    if (type  ==  "mp4") {

        this.advanceTarget.playMp4Type(fileName);

    }

    }

}

`

适配器类中持有高级接口的引用，根据文件类型初始化相应的类。所以在play方法就有了相应的实例，可以调用具体的方法。

现在，我们初始化好了适配器，主角播放器也该上场了，是到播放音乐的时候。

`

class  Player  implements  Target  {

    mediaAdapter  :  MediaAdapter;

    play(type :  string, fileName :  string)  :  void  {

        if(type  ==  "mp3") {

            //mp3直接播放

        }  else  if (type  ===  "vlc"  ||  type  ==  "mp4") {

            this.mediaAdapter  =  new  MediaAdapter(type);

            this.mediaAdapter.play(type,  fileName);

        }  

    }

}

`

下面我们进行下测试，

`

const player =  new  Player();

player.play("mp4",  "笑看风云.mp4");

player.play("vlc",  "烟雨唱扬州.vlc");

player.play("mp3",  "背水姑娘.mp3");

player.play("wma",  "左手指月.mp3");



测试结果：

笑看风云.mp4 is palying

烟雨唱扬州.vlc is palying!

Mp3 as the basic format, can play at will

sorry,type wma is not support

`

从上面的测试结果可以看出，两个不同的接口可以在一起愉快地通信了。爽歪歪。

最后我们总结下适配器的优点：

将接口或者数据转换代码分离了出来，代码看起来非常清晰。也同样遵循开闭原则，能在不修改现有客户端代码的情况下在程序中添加新类型的适配器。

适配器模式使整体复杂度增加，这是因为你每增加一种需要适配的类型，都要增加相应的接口和实现类。



#### 4.1.4观察者模式

观察者模式（Observer Pattern）又叫做发布-订阅模式(Pub/Sub)模式或消息机制。帮你的对象知悉现状，能及时响应订阅的事件，可以看成是一种一对多的关系。当一个对象的状态发生改变时，所有依赖它的对象都应得到通知。
观察者模式是松耦合设计的关键。
我们用淘宝购物中的一个例子来理解观察者模式。
你在淘宝上找到一款心仪的电脑，是最新发布的16寸的Mackbook Pro,但是联系卖家后发现没货，鉴于商铺比较好的信誉度和比较大的优惠力度，你觉得还是在这家买比较划算，所以就问卖家什么时候有货，商家告诉你需要等一周左右，还友情提示你:"亲，你可以先收藏我们的店铺，等有货了会再通知你的"，你收藏了店铺。电脑发烧友可不止你一个，小明、小华等陆陆续续也都收藏了该店铺。</br>
从上面的故事中可以看出，这是一个典型的观察者模式，店铺老板是发布者，你、小明、小华都是订阅者。Mac电脑到货(即状态改变)，会依次通知你、小明，小华等，使用旺旺等工具依次给他们发布消息。

下面我们看下基本的模型：

![](/Users/eason/Desktop/github/front-end-complete-book/chapter04/images/4-1-1.png)

在上面的模型中可以看出，商家维护着和各位客户的引用关系，通过观察者添加、解除引用关系，就好比说，某天某客户不再中意这款电脑，商家就再无引用这份关系了。

> 本书中所有的代码均是由Typescript描述，众所周知，Typescript为Js的超集，具有强类型约束，在编译期就可以消除安全隐患，具体的介绍可以参考管网，[https://www.typescriptlang.org/](https://www.typescriptlang.org/), 也可以联系笔者可以共享的电子书

下面我们看下代码模型，先看下商家的代码实现：

`

import Customer from  "{path}/CustomerModal";

export  default  class  Seller  {

  customers:  Customer[];

  register(customer):  void  {

   this.customers.push(customer);

}

remove(id:  number):  void  {

  this.customers.forEach(c  =>  {

  if (c.getId() ===  id) {

   console.log(`this id: ${id} should be removed`);

  }

  });

}

notifyAll():  void  {

  this.customers.forEach(cus  =>  {

   cus.dealOrder();

   });

   }

}

`

customers属性维护着所有订阅者，数组中的 每个元素都是Customer对象，我们从模拟对象出发，抽象出该对象：

`

export  default  class  Customer  {

  private  id:  number;

  private  name:  string;

  private  address:  string;

  private  telNum:  string;

  private  orders:  Order[];

constructor(_id:  number, _name:  string, _address:  string, _telNum:  string)  {

  this.id  =  _id;

  this.name  =  _name;

  this.address  =  _address;

  this.telNum  =  _telNum;

}

getId():  number  {

  return  this.id;

}

dealOrder():  void  {

  //make a order

   console.log(`I am + ${this.name}， I have got message from seller`);

  }

}

`

看了商家的模型后，来看下观察者模式的模型：

`

import Seller from  "./Seller";

import Customer from  "./CustomerModal";

export  default  class  Observer  {

  constructor()  {

   this.seller  =  new  Seller();

  }

  private  seller:  Seller;

  register(customer:  Customer):  void  {

   console.log("");

   this.seller.register(customer);

  }

fire():  void  {

  this.seller.notifyAll();

}

remove(customerId:  number):  void  {

  this.seller.remove(customerId);

}

}

`

上面的代码中，是从OOP的实现方式出发进行设计。已经有了观察者模式所需要的两个主要元素：主题（商家）和观察者（各位客户），一旦数据改变，新的数据就会以某种形式推送到观察者的手上。

现在我们来测试下这几段代码：

`

let customer1 =  new  Customer(1101,  "caozn",  "shanxi",  "12900000");

let os =  new  Observer();

os.register(customer1);

let customer2 =  new  Customer(1102,  "houyw",  "henan",  "12900001");

os.register(customer2);

console.log(os.getAllCustomers().length);

os.fire();

`

得到的结果如下：

`

现在商家有 2 个客户订阅

I am caozn， I have got message from seller

I am houyw， I have got message from seller

`

主题和观察者之间定义了一对多的关系。观察者依赖整个主题（商家），毕竟要从主题那里获得通知。并且主题是具有状态的，也可以控制这些状态。

观察者模式定义了主题和观察者之间的松耦合关系，并且还可以让两者进行交互，而不用太关注对方的细节。"keep it simple".当然缺点也不是完全没有的， 如果过多的使用发布订阅模式, 会增加维护的难度。

#### 4.1.5代理模式

代理模式是一种结构性模式，作用是提供一个中间对象，为其他对象提供控制这个对象的能力。

代理模式在现实的生活中有很多的实例，信用卡是银行账号代理，银行账号则是一捆一捆现金的代理，他们都有相同的功能(接口)-付款。信用卡的付款方式让用户和商户都比较满意，用户不用随身携带大量的现金，商户也因为交易收入能以电子化的方式进入银行账户中，  无需担心存款时出现现金丢失或被抢劫的情况，减少很多的麻烦。

影视剧86版《西游记》中也有代码模式的影子，在第七集《计收猪八戒》中，孙悟空为了给高家“除妖”，扮成高翠兰的模样。从代理模式的角度看，对高翠兰的外貌和行为抽象成接口，高小姐和孙悟空都实现这个接口，孙悟空就是高小姐的代理类。

我们的例子以一个求婚为原型进行说明，一位男士想向他女朋友求婚，但由于各种原因不好意思说出口，就想请他的好朋友（办大事得找个靠谱的朋友）帮忙转达意思。

![](/Users/eason/Desktop/github/front-end-complete-book/chapter04/images/proxy.jpg)

先看下接口

`

 interface  Subject  {

    proposal()  :  void;

}

`

实现类

`

class  RealSubject  implements  Subject  {

    public  proposal():  void  {

        console.log("Darling, Can you marray me?");

    }

}

`

代理类

`

class  Proxy  implements  Subject  {

    private  realSubject  :  RealSubject;

    private  chcekIsGoodFriend()  :  boolean  {

        console.log("It's is checking if good friend");

        const  r  =  Math.ceil(Math.random() *  10);

        //只有够意思才给你传话

        if (r  >  6  ||  r  ==  6) {

            return  true;

        }  else  {

            return  false;

        }

    }

    private  checkPromission()  {

        console.log("It's checking the promission");

        if (this.chcekIsGoodFriend()) {

            return  true;

        }

        return  false;

}

    public  proposal()  :  void  {

         if(this.checkPromission()) {

            this.realSubject.proposal();

        }

    }

}

`

帮忙传话需要征得当事人的同意(checkPromission)，还是个靠谱的朋友(chcekIsGoodFriend)。这两个条件具备了，这事儿就会靠谱很多。

现在我们测试下：

`

let realSubject =  new  RealSubject();

let subject :  Subject  =  new  Proxy(realSubject);

subject.proposal();

`

请自行检测啊，看某位朋友靠不靠谱，同意还是不同意。



代理模式的优缺点：

代理模式可以代理目标对象，并且是在毫无绝唱的情况下进行。

#### 4.1.6装饰者模式

#### 4.2 V8引擎该了解的

#### 4.3 任务详解

#### 4.4 异步加载规范

#### 4.5 函数式编程入门

#### 4.6 实践

  4.6.1 v-dom原理剖析

  4.6.2 状态原理解析
