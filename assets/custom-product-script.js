// script for our custom pdp - I'll use IIFE
(()=> {
    // All selectors
    const containerSelector = '#customProduct'
    const productDataSelector = '[js-custom-product-json]'
    const atcFormSelector = '#custom-product-form'
    const optionSelector = '[js-option]'
    const optionSelectSelector = '[js-select-option]'
    const currentImgSelector = '[js-current-img]'
    const addToCartBtnSelector = '.add-to-cart'

    
    const container = document.querySelector(containerSelector)
    const options = container.querySelectorAll(optionSelector)
    const selectOption = container.querySelector(optionSelectSelector)
    const currentImage = container.querySelector(currentImgSelector)
    const addToCartForm = document.querySelector(atcFormSelector)
    const atcBtn = container.querySelector(addToCartBtnSelector)

    const productDataJson = container.querySelector(productDataSelector)

    let discountedOption = false
    
    const productData = JSON.parse(productDataJson.innerHTML)
    const variants = productData.variants
    console.log({productData})

    const selectedIndex = document.querySelector(`${optionSelectSelector}`).selectedIndex
    selectedSize = document.querySelectorAll(`${optionSelectSelector}`)[0][selectedIndex]

    console.log({selectedSize})
    if(selectedIndex == 0 || selectedSize.value == "unselected") {
        atcBtn.classList.add('disabled')
    }else {
        atcBtn.classList.remove('disabled')
    }
    // set event listeners
    options.forEach(option => option.addEventListener('click', optionChange))
    selectOption.addEventListener('change', optionChange)
    addToCartForm.addEventListener('submit', addToCart)

    function optionChange() {
        const target = event.target
        if(event.type == 'click') {
            const selectedImgUrl = target.dataset.imageUrl
            currentImage.src = selectedImgUrl
        }

        let selectedOptionColor = document.querySelector(`${optionSelector}:checked`)
        let selectedColorValue = selectedOptionColor.value

        const selectedIndex = document.querySelector(`${optionSelectSelector}`).selectedIndex
        let selectedSize, selectedTitle=0

        let selectedVariant=0

        if(selectedIndex >= 1) {
            selectedSize = document.querySelectorAll(`${optionSelectSelector}`)[0][selectedIndex]
            atcBtn.classList.remove('disabled')
        }else {
            atcBtn.classList.add('disabled')
        }
        if(selectedSize) {
            variantTitle = `${selectedColorValue} / ${selectedSize.value}`
        }else {
            variantTitle = selectedColorValue
        }

        console.log({variantTitle})

        if(variantTitle == 'Black / Medium') {
            console.log("dddddisc")
            // for item[0] property value update
            const propertyValueSelectorItem0 =  '[js-product-property-data]'

            // to get track of bonus item, 
            const newTimeStamp = Date.now()

            console.log("discounted variant..!")
            discountedOption= true
            let bonusVariant = "bonus"
            bonusVariantId = discountedProduct(bonusVariant)
            
            document.querySelector(propertyValueSelectorItem0).value = newTimeStamp 
            let newFormItem = `<input type="hidden" value='1' name='items[1][quantity]' js-bonus-item>
            <input type="hidden" name='items[1][id]' value='${bonusVariantId}' js-bonus-item> <input type="hidden" name="items[1][properties][price_ref]" value='${newTimeStamp}'> `

            let formData_ = document.querySelector('#custom-product-form')
            formData_.insertAdjacentHTML('beforeEnd', newFormItem)
        }else {
            let bonusField  = document.querySelectorAll('[js-bonus-item]')
            bonusField.forEach(inpt => {
                inpt.remove()
            })
        }

        if(variantTitle.includes('/')) {
            variants.map(variant => {
                if(variant.available && variant.title == variantTitle) {
                    selectedVariant = variant
                    return
                }
            })
        }else {
            variants.map(variant => {
                if(variant.available && variant.title.includes(variantTitle)) {
                    selectedVariant = variant
                    return
                }
            })
        }

        console.log(selectedVariant)
        renderContent(selectedVariant)


    }
    function renderContent(variant) {
        const productPriceSelector = '[js-product-price]'
        const variantUpdateSelector = '[js-product-variant-data]'
        

        const productPrice = container.querySelector(productPriceSelector)
        const variantIdUpdate = container.querySelector(variantUpdateSelector)

        productPrice.innerHTML = Shopify.currency.active + variant.price / 100
        variantIdUpdate.setAttribute('value', variant.id)

        if(!variant.available) {
            atcBtn.classList.add('disabled')
        }

    }
    function discountedProduct(varTitle) {
        let bonusVarId = 0
        const productForDiscount = JSON.parse(document.querySelector('[js-bonus-product-json]').innerHTML)

        const variants = productForDiscount.variants
        console.log({variants}, {varTitle})
        variants.map(variant => {
            if(variant.title == varTitle) {
                bonusVarId = variant.id
            }
        })

        return parseInt(bonusVarId)

    }
    function addToCart(e) {
        e.preventDefault()

        const variantData = document.querySelector('[js-product-variant-data]')

        let formdata = document.querySelector('#custom-product-form')
        let fdd = new FormData(formdata)

        fetch(window.Shopify.routes.root + 'cart/add.js', {
            method:'POST',
            body: fdd
        })
        .then(response => {
            return response.json()
        })
        .catch((err) => {
            console.error('Error : ', err)
        })
    }
})()