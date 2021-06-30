export const ngServeData = {
  paintersList: {
    '0': {
      _id: '0',
      organizationName: '7 Oaks Painting & Remodeling',
      picture: 'https://s3.amazonaws.com/spoonflower/public/design_thumbnails/0451/0739/rPaisley_Black13_shop_thumb.png',
      bio: "We're a Des Moines based painting company that's been in business for 7 years, offering " +
        "a wide variety of painting and remodeling services. We're a small, family business that strives " +
        "to provide the highest quality services with cleanliness and respect.",
      website: 'https://twitter.com/POTUS',
      numberOfEmployees: 3,
      founded: 2014,
      rating: 4.9,
      ratingCount: 11,
      completedJobCount: 14,
      services: ['interiorPainting', 'exteriorPainting', 'cabinets', 'deckPaint/Stain', 'wallpaperRemoval'],
      address: {
        streetAddress: '1234 5th St',
        city: 'Des Moines',
        state: 'IA',
        zipCode: 50315
      },
      accountStatus: 'active',
      warranty: '2 years',
      insurance: {
        effectiveDate: new Date('2020-05-01'),
        expirationDate: new Date('2021-05-01'),
        fileLocation: ''
      },
      socialMedia: {
        twitter: 'https://twitter.com/POTUS',
        facebook: 'https://www.facebook.com/POTUS/',
        instagram: '',
        google: ''
      },
      photosOfPastWork: (() => {
        const photosOfPastWork = [];
        for (let i = 1; i <= 7; ++i) {
          photosOfPastWork.push({
            url: `https://us-east-1.linodeobjects.com/homepainter-images-development/example${i}.JPG`,
            originalName: `example${i}.jpg`
          });
        }
        return photosOfPastWork;
      })()
    },
    '1': {
      _id: '1',
      organizationName: "Paul's Painting",
      picture: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/MediBang_Paint_logo.png',
      bio: "We're an Ames based painting company that offers cheep rates and prides itself on getting your project done fast",
      website: 'https://twitter.com/POTUS',
      numberOfEmployees: 2,
      founded: 2019,
      rating: 4.3,
      ratingCount: 3,
      completedJobCount: 5,
      services: ['interiorPainting', 'exteriorPainting', 'cabinets'],
      address: {
        streetAddress: '122 3th St',
        city: 'Ames',
        state: 'IA',
        zipCode: 50014
      },
      accountStatus: 'active',
      warranty: '2 years',
      insurance: {
        effectiveDate: new Date('2020-05-01'),
        expirationDate: new Date('2021-05-01'),
        fileLocation: ''
      },
      socialMedia: {
        twitter: '',
        facebook: '',
        instagram: '',
        google: ''
      },
      photosOfPastWork: (() => {
        const photosOfPastWork = [];
        for (let i = 1; i <= 2; ++i) {
          photosOfPastWork.push({
            url: `https://us-east-1.linodeobjects.com/homepainter-images-development/example${i}.JPG`,
            originalName: `example${i}.jpg`
          });
        }
        return photosOfPastWork;
      })()
    },
    '2': {
      _id: '2',
      organizationName: 'Delta Painting',
      picture: 'http://www.clipartbest.com/cliparts/KTn/XrA/KTnXrAyLc.png',
      bio: "interior painting, exterior painting, and fence staining; reputable family company in business for 3 years",
      website: 'https://twitter.com/POTUS',
      numberOfEmployees: 3,
      founded: 2018,
      rating: 4.6,
      ratingCount: 0,
      completedJobCount: 0,
      services: ['interiorPainting', 'exteriorPainting', 'fenceStaining'],
      address: {
        streetAddress: '455 6th Ave',
        city: 'Des Moines',
        state: 'IA',
        zipCode: 50315
      },
      accountStatus: 'active',
      warranty: '2 years',
      insurance: {
        effectiveDate: new Date('2020-05-01'),
        expirationDate: new Date('2021-05-01'),
        fileLocation: ''
      },
      socialMedia: {
        twitter: '',
        facebook: '',
        instagram: '',
        google: ''
      },
      photosOfPastWork: []
    },
  }
}
