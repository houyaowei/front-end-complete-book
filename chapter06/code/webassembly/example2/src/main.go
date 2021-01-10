package main

import (
	"fmt"
	"syscall/js"
)

func MyGoFunc() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return map[string]interface{}{
			"hello":  "myGoFunc invoked ",
			"name": "houyw",
		}
	})
}
func main() {
	signal := make(chan int)
	//s.Value 类型的结构体，它指代 JS 中的全局对象
	win := js.Global()
	doc := win.Get("document")
	body := doc.Get("body")

	//在window上定义一个方法，供dom调用
	win.Set("MyGoFunc", MyGoFunc())

	//create new div start
	newDiv := doc.Call("createElement", "div")
	newDiv.Set("innerHTML", "create new div when page onload")
	newDiv.Set("style","border: 1px solid red")
	body.Call("appendChild", newDiv)
	// create new div end

	alertBtn := doc.Call("getElementById", "alert")
	alertBtn.Set("onclick", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		alert := win.Get("alert")
		alert.Invoke("hello, this alert btn")
		return nil
	}))
	//
	btn := doc.Call("getElementById", "test")

	var callback js.Func
	callback = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		fmt.Println("click invoke")
		fmt.Println(args)
		btn.Set("innerHTML", "changed by go")
		return nil
	})
	btn.Call("addEventListener", "click", callback)

	<- signal
}
