const buttonsToAddNumbers = document.querySelectorAll(".is-numerics-elements button"),
      buttonsToAddOperacional = document.querySelectorAll(".is-operational-elements button"),
    input = document.getElementById("theInputArea");

const btnClearAll = document.querySelector("#clearAll"), 
btnClearSect = document.querySelector("#ClearSect"), 
btnClearLast = document.querySelector("#clearLast"),
btnPercent = document.querySelector("#percent");   

const btnHistory = document.querySelector("footer button"),
btnResult = document.querySelector("footer button:nth-child(2)");

let listBtnToAddNmbers = buttonsToAddNumbers.length, listBtnToAddOperacional = buttonsToAddOperacional.length,
 verification_1 = (listBtnToAddNmbers && listBtnToAddOperacional) > 0, 
 btnEspecialFunction = 9, elements;

const allOperacionalChars = ["+", "-", "*", "/", "%"]

if(verification_1){
    for(elements = 0; elements < listBtnToAddNmbers; elements++){

        if(elements != btnEspecialFunction)
        {
            buttonsToAddNumbers[elements].onclick = (e) =>{
                AddCharsInInput(e.target)
            } 
         }

       else{
        buttonsToAddNumbers[elements].onclick = () =>{
            input.value = "-" + input.value
          }

       }
    }

    for(elements = 0; elements < listBtnToAddOperacional; elements++){
        buttonsToAddOperacional[elements].onclick = (e) =>{
            if(input.value != 0) 
                return AddCharsInInput(e.target)

        }   
     }

}


btnClearAll.onclick = () =>{
    input.value = "0"
}

btnClearLast.onclick = () =>{
    let newInputValue = Array.from(input.value)
    elements = newInputValue.length
    input.value = ""
    for(let interations = 0; interations < elements - 1; interations++){
        input.value += newInputValue[interations];
    }
}
btnClearSect.onclick = () =>{
    let String = input.value
    let allComposition = String.split(/\b/)
    let lastItem = allComposition.length - 1
    input.value = ""
    for(let interations = 0; interations < lastItem; interations++)
    {
        input.value += allComposition[interations]
    }
}

btnPercent.onclick = () =>{
    if(input.value != 0){
        let findResult = input.value.match(/\W/)
        if(findResult < 1 || findResult === null)
            return input.value = parseInt(input.value) / 100
        return input.value += "%" 
    }
}

btnResult.onclick = () =>{
    FinalResult()
}


let AddCharsInInput = (element) => {
    if(input.value != 0) 
         return input.value += element.textContent
    return input.value = "" + element.textContent
}

let FinalResult = () =>{
    let result = eval(input.value)
    input.value = result
}

let exceptionsError = () =>{
    //make the exceptions and give basic errors with typescript
}

