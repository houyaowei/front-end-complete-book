package funcs

import "fmt"

var a = 6;

func p (){
	fmt.Println("p():",a)
}

func q(){
	a := 5
	fmt.Println("q():", a)
}
func GetVariable(){
	p()
	q()
	p()
}

func FuncWithParam() string{
	return "func with return value"
}

func DeferPrint(){
	for i:=0; i < 5 ; i++ {
		defer fmt.Print(i)
	}
}

func UnsureParameters(args ...int){
	for _, n := range args   {
		fmt.Println(n)
	}
	a:= func() {
		println("func in variable")
	}
	a()
}