describe("Datepicker directive tests: ", function() {
  var mockScope
  var compileService
  
  beforeEach(angular.mock.module("datepicker"))

  beforeEach(angular.mock.inject(function($rootScope, $compile) {
    mockScope = $rootScope.$new()
    compileService = $compile
    mockScope.dateValue = new Date()
    mockScope.minDate = new Date()
    mockScope.maxDate = new Date(mockScope.minDate.getTime() + 365*24*60*60*1000)
    mockScope.quickDates = [
      {date: new Date("July 13, 1961 00:00:00"), description: 'My birthday'},
      {date: new Date(0), description: 'epoch'},
      {date: new Date(), description: 'today'},
      {date: new Date("Dec 31, 2099 23:59:59"), description: 'End of the century'}
    ]
  }))

  it("Generates default datepicker elements", function(){
    var compileFn = compileService("<div my-datepicker value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
    expect(elem.children().length).toEqual(3)
    expect(elem.children().eq(1).children().length).toEqual(12)
    expect(elem.children().eq(1).find("option").eq(0).text()).toEqual('01')
    expect(elem.children().eq(1).find("option").eq(11).text()).toEqual('12')
  })

  it("Generates datepicker elements for format ddMMyy", function(){
    var compileFn = compileService("<div my-datepicker format='ddMMyy' value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
    expect(elem.text()).toEqual('010203040506070809101112')
  })

  it("Sets a 2-digit date in the 20th century", function(){
    mockScope.dateValue = new Date("July 13, 1981 00:00:00")
    var compileFn = compileService("<div my-datepicker format='ddMMyy' value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
    expect(elem.text()).toEqual('010203040506070809101112')
  })

  it("Generates datepicker elements for format ddMMMyyyy", function(){
    var compileFn = compileService("<div my-datepicker format='ddMMMyyyy' value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
    expect(elem.text()).toEqual('JanFebMarAprMayJunJulAugSepOctNovDec')
    expect(elem.children().length).toEqual(3)
    expect(elem.children().eq(1).children().length).toEqual(12)
    expect(elem.children().eq(1).find("option").eq(0).text()).toEqual('Jan')
    expect(elem.children().eq(1).find("option").eq(11).text()).toEqual('Dec')
  })

  it("Generates datepicker elements for format ddMMMMyyyy", function(){
    var compileFn = compileService("<div my-datepicker format='ddMMMMyyyy' value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
    expect(elem.text()).toEqual('JanuaryFebruaryMarchAprilMayJuneJulyAugustSeptemberOctoberNovemberDecember')
    expect(elem.children().length).toEqual(3)
    expect(elem.children().eq(1).children().length).toEqual(12)
    expect(elem.children().eq(1).find("option").eq(0).text()).toEqual('January')
    expect(elem.children().eq(1).find("option").eq(11).text()).toEqual('December')
  })

  it("Generates datepicker elements for format day: dd Month: MMMM year: yyyy", function(){
    var compileFn = compileService("<div my-datepicker format='day: dd Month: MMMM year: yyyy' value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
    expect(elem.text()).toEqual('day:  Month: JanuaryFebruaryMarchAprilMayJuneJulyAugustSeptemberOctoberNovemberDecember year: ')
    expect(elem.children().length).toEqual(3)
    expect(elem.children().eq(1).children().length).toEqual(12)
    expect(elem.children().eq(1).find("option").eq(0).text()).toEqual('January')
    expect(elem.children().eq(1).find("option").eq(11).text()).toEqual('December')
  })

  it("Generates datepicker elements for format MM/dd/yyyy", function(){
    var compileFn = compileService("<div my-datepicker format='MM/dd/yyyy' value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
    expect(elem.text()).toEqual('010203040506070809101112//')
    expect(elem.children().length).toEqual(3)
    expect(elem.children().eq(0).children().length).toEqual(12)
    expect(elem.children().eq(0).find("option").eq(0).text()).toEqual('01')
    expect(elem.children().eq(0).find("option").eq(11).text()).toEqual('12')
  })

  it("sets a valid date", function(){
    mockScope.dateValue = new Date()
    mockScope.minDate = new Date(0)
    mockScope.maxDate = new Date(mockScope.dateValue.getTime() + 365*24*60*60*1000)
    var compileFn = compileService("<div my-datepicker min-date='minDate' max-date='maxDate' value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
  })

  it("Generates datepicker elements with dateValue < minDate", function(){
    mockScope.dateValue = new Date(0)
    mockScope.minDate = new Date()
    mockScope.maxDate = new Date(mockScope.minDate.getTime() + 365*24*60*60*1000)
    var compileFn = compileService("<div my-datepicker min-date='minDate' max-date='maxDate' value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
  })

  it("Generates datepicker elements with dateValue > maxDate", function(){
    mockScope.dateValue = new Date("January 1, 2099 00:00:00")
    mockScope.minDate = new Date()
    mockScope.maxDate = new Date(mockScope.minDate.getTime() + 365*24*60*60*1000)
    var compileFn = compileService("<div my-datepicker min-date='minDate' max-date='maxDate' value='dateValue'></div>")
    var compileFn = compileService("<div my-datepicker min-date='minDate' max-date='maxDate' value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
  })

  it("Generates quick dates", function(){
    mockScope.date = {
      quickDateValue: new Date("July 13, 1961 00:00:00")
    }
    var compileFn = compileService("<div my-datepicker format='ddMMyyyy' quick-dates='quickDates' value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
    expect(elem.children().length).toEqual(4)
    expect(elem.children().eq(3).children().length).toEqual(5)
    expect(elem.children().eq(3).find("option").eq(0).text()).toEqual('Quick Dates')
    expect(elem.children().eq(3).find("option").eq(1).text()).toEqual('My birthday')
    expect(elem.children().eq(3).find("option").eq(2).text()).toEqual('epoch')
    expect(elem.children().eq(3).find("option").eq(3).text()).toEqual('today')
    expect(elem.children().eq(3).find("option").eq(4).text()).toEqual('End of the century')
  })
  
  it("Generates quick dates with empty format", function(){
    var compileFn = compileService("<div my-datepicker format='empty' quick-dates='quickDates' value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
    expect(elem.children().length).toEqual(1)
    expect(elem.children().eq(0).children().length).toEqual(5)
    expect(elem.children().eq(0).find("option").eq(0).text()).toEqual('Quick Dates')
    expect(elem.children().eq(0).find("option").eq(1).text()).toEqual('My birthday')
    expect(elem.children().eq(0).find("option").eq(2).text()).toEqual('epoch')
    expect(elem.children().eq(0).find("option").eq(3).text()).toEqual('today')
    expect(elem.children().eq(0).find("option").eq(4).text()).toEqual('End of the century')
  })

  it("Selects a quick date", function(){
    var compileFn = compileService("<div my-datepicker format='empty' quick-dates='quickDates' value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
    var ngModelController = elem.find('select').controller('ngModel');
    ngModelController.$setViewValue({date: new Date("July 13, 1961 00:00:00"), description: 'My birthday'});
  })

})
