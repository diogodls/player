import { Controller, Get } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { IndividualCatalogResponseDto } from './dto/individual-catalog-response.dto';

@Controller('catalog/actions')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('individual')
  getIndividualCatalog(): Promise<IndividualCatalogResponseDto> {
    return this.catalogService.getIndividualCatalog();
  }
}
