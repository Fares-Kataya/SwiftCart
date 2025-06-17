# SwiftCart

This is a full-stack web application designed for managing e-commerce products and categories. It features a robust Spring Boot backend with a PostgreSQL database and a dynamic Angular frontend, providing a comprehensive solution for product listing, searching, filtering, and administrative (CRUD) operations.

## ✨ Features

### Public/User-Facing Features
* **Product Listing:** Browse all available products with pagination.
* **Search Functionality:** Find products by title or description.
* **Category Filtering:** Filter products by specific categories.
* **Sorting:** Sort products by price (ascending/descending) or by newest arrivals.
* **Product Details:** View detailed information for individual products.

### Admin-Specific Features (Requires `ADMIN` Role)
* **Product Management (CRUD):**
    * **Create Products:** Add new products with details like title, description, price, image, category, and stock.
    * **Edit Products:** Modify existing product information.
    * **Delete Products:** Remove products from the system.
* **Category Listing:** View all available product categories.
* **User Authentication:** Secure login system with JWT (JSON Web Tokens).
* **Role-Based Authorization:** Endpoints are protected, ensuring only `ADMIN` users can perform sensitive operations.

## 🚀 Technologies Used

### Frontend
* **Angular 19+:** A powerful framework for building single-page applications.
* **TypeScript:** A superset of JavaScript that adds static types.
* **Angular Signals:** For reactive state management.
* **RxJS:** For reactive programming with asynchronous data streams.
* **Angular HttpClient:** For making HTTP requests to the backend API.
* **Lucide Angular:** For lightweight and customizable SVG icons.

### Backend
* **Spring Boot 3:** A framework for rapidly building production-ready Spring applications.
* **Java 17+:** The core programming language.
* **Spring Security:** For authentication and authorization (JWT-based).
* **Spring Data JPA / Hibernate:** For robust data access and ORM.
* **PostgreSQL:** A powerful open-source relational database.
* **Lombok:** A library to reduce boilerplate code (e.g., getters, setters, constructors).

## ⚙️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following software installed:
* **Java Development Kit (JDK) 17 or higher**
* **Maven** (for Spring Boot build automation) or **Gradle**
* **Node.js 18 or higher**
* **Angular CLI** (`npm install -g @angular/cli`)
* **PostgreSQL database server**

### Backend Setup (Spring Boot)

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-project-directory>/server # or whatever your backend folder is called
    ```
2.  **Database Configuration:**
    * Create a PostgreSQL database (e.g., `ecommerce_db`).
    * Update the database connection properties in `src/main/resources/application.properties`:
        ```properties
        spring.datasource.url=jdbc:postgresql://localhost:5432/ecommerce_db
        spring.datasource.username=your_db_username
        spring.datasource.password=your_db_password
        spring.jpa.hibernate.ddl-auto=update # or create, for initial setup
        spring.jpa.show-sql=true
        spring.jpa.properties.hibernate.format_sql=true
        ```
    * **Initial Admin User:** For initial login, you might need to manually insert an `ADMIN` user into your `users` table or have a registration endpoint. (Example: `username: admin`, `password: adminpassword` hashed with BCrypt).
3.  **Run the Backend Application:**
    * **Using Maven:**
        ```bash
        mvn spring-boot:run
        ```
    * **Using Gradle (if applicable):**
        ```bash
        ./gradlew bootRun
        ```
    The backend will start on `http://localhost:8080` by default.

### Frontend Setup (Angular)

1.  **Navigate to the frontend directory:**
    ```bash
    cd <your-project-directory>/client # or whatever your frontend folder is called
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the Frontend Application:**
    ```bash
    ng serve
    ```
    The frontend will be accessible at `http://localhost:4200` by default.

## 🔑 Authentication and Authorization

The application uses JWT (JSON Web Tokens) for authentication.
* Users log in by sending credentials to `/api/auth/login`.
* Upon successful login, a JWT token is returned. This token must be included in the `Authorization` header (`Bearer <token>`) for all subsequent requests to protected endpoints.
* Admin-specific endpoints (e.g., `POST /api/products`, `PUT /api/products/{id}`, `DELETE /api/products/{id}`) are protected with `@PreAuthorize("hasRole('ADMIN')")`, ensuring only authenticated users with the `ADMIN` role can access them.

## 🚦 Key API Endpoints

Here are some of the main API endpoints provided by the backend:

* `GET /api/products`: Retrieve a paginated list of products (with search, filter, sort options).
* `GET /api/products/{id}`: Get details of a specific product by ID.
* `GET /api/products/max-id`: Get the current maximum product ID in the database.
* `POST /api/products`: **(ADMIN Only)** Create a new product.
* `PUT /api/products/{id}`: **(ADMIN Only)** Update an existing product.
* `DELETE /api/products/{id}`: **(ADMIN Only)** Delete a product.
* `GET /api/categories`: Retrieve a list of all product categories.
* `POST /api/auth/login`: Authenticate a user and receive a JWT.

## 💡 Known Issues & Future Improvements

* **Frontend-Managed Product ID (Current Implementation):** The current frontend generates the ID for new products based on the `max-id` from the backend and increments it (`this.lastProductId() + 1`). This is a **DEMO HACK** and is highly susceptible to conflicts (duplicate key errors) in a real-world, multi-user environment, especially if the database's auto-increment sequence gets out of sync or multiple users try to add products simultaneously.
    * **Recommendation for Production:** It is strongly recommended to let the **backend (database) solely manage product ID generation** (e.g., using `@GeneratedValue(strategy = GenerationType.IDENTITY)` in JPA and ensuring the frontend does not send an `id` for new products). This requires resetting the database sequence if it's currently causing "duplicate key" errors (e.g., `ALTER SEQUENCE products_id_seq RESTART WITH 1000;` for PostgreSQL).
* **Robust Error Handling:** Enhance frontend and backend error handling for a more user-friendly experience.
* **More Advanced Filters:** Implement additional filtering options (e.g., by price range, ratings, availability).
* **Image Uploads:** Integrate a proper image upload service (e.g., cloud storage like Cloudinary or S3) instead of relying on direct image URLs.
* **User Management:** Implement full CRUD for users and roles for true admin control.
* **Reviews & Ratings:** Allow users to submit product reviews and ratings.

## 📺 Demo

You can view a live demo of the application here:

[**DEMO**](https://drive.google.com/file/d/1FnheX4uHxcelacLHZeRaY75kHZoUL6xk/view?usp=sharing)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to fork the repository, make changes, and submit pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---
