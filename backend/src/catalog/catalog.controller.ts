import { Controller, Get } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import {
  IndividualCatalogResponseDto,
  TeamCatalogResponseDto,
} from './dto/catalog-response.dto';

@Controller('catalog/actions')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('individual')
  getIndividualCatalog(): Promise<IndividualCatalogResponseDto> {
    return this.catalogService.getIndividualCatalog();
  }

  @Get('team')
  getTeamCatalog(): Promise<TeamCatalogResponseDto> {
    return this.catalogService.getTeamCatalog();
  }
}
