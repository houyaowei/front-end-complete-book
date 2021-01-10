package funcs

import "fmt"

func myfunc(args ...int){
	for _,arg:= range args{
		fmt.Println(arg)
	}
}

func myFunc2(args ...int){
	for _,arg:=range args{
		fmt.Println(arg)
	}
}

type error interface {
	error() string
}

type PathError struct {
	Op string
	Path string
	Err error
}
func (e *PathError) Error() string{
	return e.Op+ "," + e.Err.error() + "," + e.Path
}

func  PrintError()  {
	fmt.Println("error")
}