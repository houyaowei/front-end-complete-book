package exercise

import (
	"fmt"
)

const (
	Fizz = 3
	Buzz = 5
)
func PrintCharts() {
	for i:=0; i< 10 ; i++  {
		fmt.Println("index:", i)
	}
}

func LoopCharts(){

	var charts [10]int
	for i:=0; i< 10 ; i++  {
		charts[i] = i;
	}
	fmt.Printf("%v",charts)
}

func PrintFizzAndBuzz()  {
	for i:=0; i< 100 ; i++ {
		if i % Fizz == 0 {
			fmt.Println("Fizz")
		}
		if i% Buzz == 0 {
			fmt.Println("Buzz")
		}
	}
}

func PrintTrigle(){
	str:="*";
	for i:=0; i< 20 ;i++  {
		fmt.Printf("%s \n",str);
		str+= "*"
	}
}

func CountBytes(){
	str := "asSASA ddd dsjkdsjs dk"

	strBytes:= []byte(str)
	fmt.Println(len(strBytes))
}
func ReplaceStr(){
	str := "asSASA ddd dsjkdsjs dk"

	r:= []rune(str)

	copy(r[4:7],[]rune("abc"))
	fmt.Println("before:", str,"after:",string(r))

}

func ReverseStr(){
	s:= "football";
	r:= []rune(s);
	for i,j:=0,len(r) -1; i < j; i,j=i+1,j-1 {
		r[i],r[j] = r[j],r[i];
	}
	fmt.Printf("%s",string(r))

}