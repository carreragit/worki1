### Desde ahora los pr se hacen hacia testing, o sea,
### Pides que tu rama se mergee con testing no main ni master

Para ejecutar los servicios en los distintos ambiente de pruebas y testing:

### Para modo pruebas:
- ./mvnw -pl gateway spring-boot:run
- ./mvnw -pl auth-service spring-boot:run -Dspring-boot.run.profiles=local,test  
- ./mvnw -pl user-service spring-boot:run -Dspring-boot.run.profiles=local,test  
- ./mvnw -pl interaction-service spring-boot:run -Dspring-boot.run.profiles=local,test  

### Para modo normal:
- ./mvnw -pl gateway spring-boot:run
- ./mvnw -pl auth-service spring-boot:run
- ./mvnw -pl user-service spring-boot:run
- ./mvnw -pl interaction-service spring-boot:run



### Que permite esto ?

Basicamente permite jugar con la db de prueba como queramos sin afectar
La db de develop o producción
Es necesario ya que la db se comparte de forma transversal entre ramas en tu pc
