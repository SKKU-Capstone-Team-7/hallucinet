import { DocumentBuilder } from "@nestjs/swagger";

export class BaseAPIDocument {
    public buildler = new DocumentBuilder();

    public initializeOptions() {
        return this.buildler
            .setTitle('Hallucinet')
            .setDescription('Hallucinet API description')
            .setVersion('1.0.0')
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    in: 'header',
                    name: 'Authorization',
                    description: 'Enter JWT token in format **Bearer &lt;token&gt;**',
                }
            )
            .addTag('swagger')
            .addServer('')
            .build();
    }
}