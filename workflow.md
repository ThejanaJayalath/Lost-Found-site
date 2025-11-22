Lost & Found LK – Functional Workflow (Lost Module)

ok this is my work flow , first authentication progress can do finally ,so skip that for now . and in home screen it should have nav bar in that it should have 4 tabs home,lost,found,profile . those are the tabs , Home tab is already finished but update navbar according this tabs next in lost tab show all lost items that reported , this can see all people and in this had some major button called report lost , if user click this they can report something they lost, so if user click this it opens some pop up screen , in that it has sme specific fields. first is what is lost item make this like list that can select , first should be phone,laptop,purse etc., then finally others. if user select phone, it has some unique fields to fill, first is name(brand and model) of the device then it color then description for spectioll things then field for imei number, thats it now remeber our app match the lost and found phones using this imei number so you can entcript and store in database, and then some field to add some image 1-5 , those also should save on mongoDB, thats it after fill and add those images it should create post and show in lost page that can see everyone but remeber imei number not shown to anyone.then if it is laptop it is the same thing but insted of immei number that use The serial number that in back of the laptop , it also store in databse that is no need to encrypt, others are same only other thing that change is when create post this The serial number should show unlike imei number, and add button name found to that lost post if some one found that excat device they can simply click found button and inform that in to loset user , so this is only lost page add this thing for now other are later


Navigation Structure
- Home, Lost, Found, Profile tabs

Lost Tab Workflow
- Shows all lost items
- Button: Report Lost

Report Lost Popup
- Item selection: Phone, Laptop, Purse, Wallet, ID Card, Document, Pet, Bag, Other

Phone Fields:
- Device Name
- Color
- Description
- IMEI (encrypted, not shown)
- Images 1–5

Laptop Fields:
- Device Name
- Color
- Description
- Serial Number (shown)
- Images 1–5

Other Items:
- Item Name
- Color
- Description
- Optional ID Number
- Images 1–5

Lost Post Visibility:
- Public: title, color, description, location, date, images, serial number (laptop)
- Hidden: IMEI

Found Button:
- Inform owner workflow

