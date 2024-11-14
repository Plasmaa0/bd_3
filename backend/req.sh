for i in {1..100}
do
    user=andrey$i
    pass=123$i
    curl --location --request POST '127.0.0.1:8000/register?user='$user'&password='$pass
done