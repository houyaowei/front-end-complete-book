package pointer

import "fmt"

func PrintPointer() {
	var p *int
	fmt.Println(p)

	var a int = 9

	p = &a;
	*p = 10

	fmt.Println("memory address is:",p,",value is:", *p,",original value is :", a)
}
