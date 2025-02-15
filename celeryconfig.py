broker_url='redis://localhost:6379/1' #qued task is stored
result_backend='redis://localhost:6379/2' # it will store completed task 
broker_connection_retry_on_startup = True
timezone='Asia/Kolkata'