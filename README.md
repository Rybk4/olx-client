# Online marketplace for ads #

**Description:**
The project is a mobile application developed in React Native using Expo that allows users to post ads for goods and services, as well as view and interact with other users' ads.

**The main features of the app are:**
 
- Registration and authorization  
- View list of ads with the ability to filter and search
- Adding new ads with photo, description, price and category
- Edit and delete your listings
- Chat or comments for communication between buyer and seller
- Favorite listings (ability to save your favorites)
- User profile with the ability to change information and view your listings
  
**The application uses Express as a server to store data, and a MongoDB database to manage listings and users.**
 
# Project Startup #

**1. Dependencies installation**
Before launching, you need to install dependencies for the mobile app and server.

**Install Expo CLI (if not installed):**


```
npm install -g expo-cli
```


**Clone the project:**


```
git clone https://github.com/Rybk4/olx-client
```
```
cd olx-client
```
**Install dependencies:**

```
npm install
```
**2. Starting the server**
The server is written in Express and can use the MongoDB database 

**Clone the server repository:**

```
git clone https://github.com/4TeamBl4dy/olx-server
```
```
cd olx-server
```
```
npm install
```
**Start the server (specify database connection parameters in .env beforehand):**


```
npm run dev
```

**3. Launch the mobile app**
**Go back to the project root folder and launch Expo:**


```
npx expo start
```
The application can then be opened on your phone via Expo Go (Android/iOS) by scanning the QR code in the terminal or using an emulator.

**4. Customize the environment**
In the .env file (in the root of the project), specify the server URL and other API keys

Сontents of the .env file
```
PORT=” ”
MONGO_URI=” ”
CLOUDFLARE_ACCOUNT_ID=” ”
CLOUDFLARE_ACCESS_KEY_ID=” ”
CLOUDFLARE_SECRET_ACCESS_KEY=” ”
CLOUDFLARE_BUCKET_NAME=” ”
```
Make sure the database is running and available

After that, the application will be ready to run.

