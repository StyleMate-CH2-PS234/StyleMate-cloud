# Guide to Use StyleMate-cloud Backend API
## StyleMate Team
Here's the StyleMate development team:

| Name                    | Role               |  University       |                      
| ----------------------- | ------------------ | ------------------ |
| Rizka Fiddiyansyah      | Machine Learning   | Universitas Pembangunan Nasional Veteran Jawa Timur |              
| Abulkhair Rizvan Yahya  | Machine Learning   | Politeknik Elektronika Negeri Surabaya |                     
| Erlangga Yudi Pradana   | Machine Learning   | Politeknik Elektronika Negeri Surabaya |                    
| Ahmad Yazid Isnandar    | Cloud Computing    | Universitas Pembangunan Nasional Veteran Jawa Timur |                     
| Rayyan Nur Fauzan       | Cloud Computing    | Universitas Negeri Surabaya |                      
| Rohmat Ubaidillah Fahmi | Mobile Development | Universitas Pembangunan Nasional Veteran Jawa Timur |                 
| Dias Khairul Ihsan      | Mobile Development | Universitas Muhammadiyah Surakarta |

<br>

## How to run on a local computer
<br>

### Requirements:
1. Node.js: Install Node.js version 18. You can download it from the [official Node.js website](https://nodejs.org/). You can also use a version manager like [nvm](https://github.com/nvm-sh/nvm) to manage multiple versions of Node.js on your machine.
2. npm: This is the Node.js package manager, it comes bundled with Node.js. You will use it to install Express.js and other dependencies.
3. A text editor or IDE: You will need a text editor or an Integrated Development Environment (IDE) to write your code. Examples include Visual Studio Code, Atom, or Sublime Text.
4. Postman or Thunder Client (Optional): This is a tool that you can use to test your API endpoints. It's not necessary, but it can make testing easier.
5. Git (Optional): Version control system to manage your codebase. It's not necessary for running the application, but it's good practice to use version control.
<br>

### Steps to run:
1. **Clone the repository**: Clone repo it to your local machine using 
   ```bash
   git clone https://github.com/shuyshuys/StyleMate-cloud
   ``` 
or you can download it to zip via github web.
2. **Navigate to the project directory**: Use the command `cd StyleMate-cloud` to navigate into the root directory of the project.
   ```bash
   cd StyleMate-cloud
   ``` 
3. **Install dependencies**: Run `npm install` to install all the project dependencies specified in the `package.json` file.
   ```bash
   npm install
   ```
4. **Set up environment variables**: This project use .env to store some variable, make sure to set them up. make a copy of `.env.example` to `.env` and enter the required variable data. 
   ```bash
   cp .env.example .env
   ```
5. **Start the server**: Run `npm start` to start the Express.js server.
   ```bash
   npm start
   ```
6. **Test the API**: Once the server is running, you can test the API endpoints. You can do this using tool like Postman.
7. **Stop the server**: When you're done, you can stop the server by pressing `Ctrl+C` in the terminal where the server is running.
<br>

### Deployment with Docker
This project includes a Dockerfile that allows you to create a Docker image of the application and run it in a Docker container. Here are the steps to do this:
1. **Install Docker**: If you haven't already, first [install Docker](https://docs.docker.com/get-docker/) on your machine.
2. **Make sure already in directory of StyleMate-cloud**
3. **Build the Docker image**: Navigate to the project directory in your terminal and run the following command to build a Docker image:
    ```bash
    docker build -t stylemate-api .
    ```
    This command builds a Docker image using the Dockerfile in the current directory, and tags it with the name "stylemate-api". You can replace "stylemate-api" with whatever name you want to give your Docker image.
4. **Run the Docker container**: Once the image is built, you can run it in a Docker container with the following command:
    ```bash
    docker run -p 3000:3000 stylemate-api
    ```
    This command starts a Docker container from the "stylemate-api" image, and maps port 3000 in the container to port 3000 on your machine. You can replace "3000:3000" with whatever port mapping you want to use. If you want make image run persistent on background, add `-d` when running it.
5. **Access the application**: Once the Docker container is running, you can access the application by navigating to `http://localhost:3000` in your web browser (or replace "3000" with whatever port you mapped to in the previous step).
6. **Stop the Docker container**: When you're done, you can stop the Docker container by pressing `Ctrl+C` in the terminal where the container is running. Alternatively, you can find the container ID with `docker ps`, then run `docker stop <container-id>`.

<br>

## Contribution
Project finalized on December 22, 2023, closed to contributions.
<br>

## Contact Information
If you have any questions or feedback, please contact the developer at stylemate@ahmadyaz.my.id.

## End
Thank you for exploring the StyleMate-cloud repository. We hope you find joy in this collection of code. Enjoy using it!
