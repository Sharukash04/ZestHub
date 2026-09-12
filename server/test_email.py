import asyncio

from app.email_service import send_email


async def main():
    result = await send_email(
        to_email="sharukash01@gmail.com",
        subject="ZestHub Email Test 🍽️",
        html="""
        <!DOCTYPE html>
        <html>
        <body style="
            font-family: Arial, sans-serif;
            background-color: #fff8f5;
            padding: 40px;
        ">

            <div style="
                max-width: 600px;
                margin: auto;
                background: white;
                padding: 30px;
                border-radius: 15px;
            ">

                <h1 style="color: #e85d04;">
                    ZestHub Email Test 🍽️
                </h1>

                <p>
                    Congratulations!
                </p>

                <p>
                    Your ZestHub email system is working successfully.
                </p>

                <p>
                    This email was sent through FastAPI and Resend.
                </p>

            </div>

        </body>
        </html>
        """
    )

    print("Email result:", result)


if __name__ == "__main__":
    asyncio.run(main())