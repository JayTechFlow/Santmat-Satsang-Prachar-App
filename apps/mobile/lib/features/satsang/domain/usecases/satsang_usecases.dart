import '../../../../core/utils/result.dart';
import '../entities/satsang_entity.dart';
import '../entities/satsang_filter_entity.dart';
import '../repositories/satsang_repository.dart';

class GetLatestSatsangsUseCase {
  final SatsangRepository _repository;

  GetLatestSatsangsUseCase(this._repository);

  Future<Result<List<SatsangEntity>>> call() {
    return _repository.getLatestSatsangs();
  }
}

class GetFeaturedSatsangsUseCase {
  final SatsangRepository _repository;

  GetFeaturedSatsangsUseCase(this._repository);

  Future<Result<List<SatsangEntity>>> call() {
    return _repository.getFeaturedSatsangs();
  }
}

class GetPopularSatsangsUseCase {
  final SatsangRepository _repository;

  GetPopularSatsangsUseCase(this._repository);

  Future<Result<List<SatsangEntity>>> call() {
    return _repository.getPopularSatsangs();
  }
}

class GetSatsangDetailsUseCase {
  final SatsangRepository _repository;

  GetSatsangDetailsUseCase(this._repository);

  Future<Result<SatsangEntity>> call(String id) {
    return _repository.getSatsangDetails(id);
  }
}

class SearchSatsangsUseCase {
  final SatsangRepository _repository;

  SearchSatsangsUseCase(this._repository);

  Future<Result<List<SatsangEntity>>> call(String query) {
    return _repository.searchSatsangs(query);
  }
}

class FilterSatsangsUseCase {
  final SatsangRepository _repository;

  FilterSatsangsUseCase(this._repository);

  Future<Result<List<SatsangEntity>>> call(SatsangFilterEntity filter) {
    return _repository.filterSatsangs(filter);
  }
}
